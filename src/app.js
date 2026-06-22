(function () {
  const { useEffect, useMemo, useState } = React;
  const h = React.createElement;

  const STORAGE_KEY = "clearpath-operational-reality-assessment-v1";
  const RESPONDENT_KEY = "clearpath-respondent-v1";
  const ENDPOINT_KEY = "clearpath-sheets-endpoint-v1";
  const ASSESSMENT_ID_KEY = "clearpath-assessment-id-v1";
  const configuredEndpoint =
    (window.CLEARPATH_CONFIG && window.CLEARPATH_CONFIG.sheetsEndpoint) || "";

  const diagnosticPathOptions = [
    { value: "general_operations", label: "General Operations" },
    { value: "healthcare_access_flow", label: "Healthcare Access Flow" },
    { value: "executive_integration", label: "Executive Integration" },
    { value: "ai_readiness", label: "AI Readiness" }
  ];

  const scaleOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" }
  ];

  const dependencyOptions = [
    { value: "", label: "Select disruption level" },
    { value: "almost_none", label: "Almost none" },
    { value: "isolated_workflows", label: "Isolated workflows" },
    { value: "several_important_workflows", label: "Several important workflows" },
    { value: "many_critical_workflows", label: "Many critical workflows" },
    { value: "severe_disruption", label: "Severe disruption" }
  ];

  const exceptionRateOptions = [
    { value: "", label: "Select standard-process rate" },
    { value: "90-100", label: "90-100%" },
    { value: "70-89", label: "70-89%" },
    { value: "50-69", label: "50-69%" },
    { value: "30-49", label: "30-49%" },
    { value: "below-30", label: "Below 30%" }
  ];

  const steps = [
    {
      id: "context",
      title: "System Context",
      kicker: "Define the operating arena.",
      fields: [
        {
          id: "diagnosticPath",
          label: "Primary Diagnostic Path",
          prompt: "Which CLEARPATH diagnostic pathway should this assessment follow?",
          type: "select",
          defaultValue: "general_operations",
          options: diagnosticPathOptions
        },
        {
          id: "primarySystem",
          label: "Primary System",
          prompt: "What specific service, workflow, or department are we examining?",
          type: "text",
          placeholder: "Example: Client onboarding, fulfillment, intake, service desk"
        },
        {
          id: "strategicAim",
          label: "Strategic Aim",
          prompt: "What is the intended outcome of this system?",
          type: "textarea",
          placeholder: "Describe what this system should reliably accomplish."
        },
        {
          id: "stakeholders",
          label: "Stakeholders",
          prompt: "Who is most affected by this system?",
          type: "textarea",
          placeholder: "Name internal teams, customers, partners, or leadership groups."
        }
      ]
    },
    {
      id: "pain",
      title: "Operational Pain",
      kicker: "Capture the visible instability.",
      fields: [
        {
          id: "symptoms",
          label: "Symptoms",
          prompt: "Where is operational pain most visible to the team or customers?",
          type: "textarea",
          placeholder: "Missed handoffs, late responses, rework, complaints, backlog spikes..."
        },
        {
          id: "escalationPatterns",
          label: "Escalation Patterns",
          prompt: "What issues are repeatedly escalated to leadership?",
          type: "textarea",
          placeholder: "Describe the recurring issues that need senior attention."
        },
        {
          id: "interruptionPatterns",
          label: "Interruption Patterns",
          prompt: "Where does work most frequently become reactive, interruption-driven, or difficult to control?",
          type: "textarea",
          placeholder: "Where does planned work get pulled off course?"
        }
      ]
    },
    {
      id: "flow",
      title: "Flow & Delay",
      kicker: "Find where motion turns into drag.",
      fields: [
        {
          id: "entryPoint",
          label: "Entry Point",
          prompt: "How and where does work formally enter the system?",
          type: "textarea",
          placeholder: "Forms, emails, tickets, verbal requests, meetings, CRM triggers..."
        },
        {
          id: "delayWaiting",
          label: "Delay & Waiting",
          prompt: "Where does work most frequently stall, wait, or require follow-up?",
          type: "textarea",
          placeholder: "Name the queues, approvals, dependencies, or waiting states."
        },
        {
          id: "workarounds",
          label: "Workarounds",
          prompt: "What unofficial workarounds, side systems, spreadsheets, or heroics are required to keep work moving?",
          type: "textarea",
          placeholder: "List the shadow systems and manual saves people rely on."
        },
        {
          id: "dependencyConcentration",
          label: "Dependency Concentration",
          prompt: "If your three most experienced employees were unavailable for two weeks, what would become difficult to sustain?",
          type: "textarea",
          placeholder: "Name the knowledge, decisions, relationships, or recovery work concentrated in a few people."
        },
        {
          id: "coordinationBurden",
          label: "Coordination Burden",
          prompt: "Where do employees spend significant time coordinating, checking status, chasing information, or reconnecting fragmented work?",
          type: "textarea",
          placeholder: "Describe the status-chasing and handoff friction."
        }
      ]
    },
    {
      id: "clarity",
      title: "Clarity & Trust",
      kicker: "Surface ambiguity and confidence gaps.",
      fields: [
        {
          id: "ambiguity",
          label: "Ambiguity",
          prompt: "Which parts of the process feel unclear, inconsistent, or open to interpretation?",
          type: "textarea",
          placeholder: "Policies, ownership, decision rights, process steps, definitions..."
        },
        {
          id: "decisionConsistency",
          label: "Decision Consistency",
          prompt: "How often would two qualified employees reach different conclusions when reviewing the same work item?",
          type: "scale",
          lowLabel: "1 = Almost never",
          highLabel: "5 = Very often",
          options: scaleOptions
        },
        {
          id: "priorityEscalation",
          label: "Priority Escalation",
          prompt: "Where do priorities frequently shift, conflict, or require escalation to gain attention?",
          type: "textarea",
          placeholder: "Describe the areas where urgency or authority becomes unclear."
        },
        {
          id: "trustErosion",
          label: "Trust Erosion",
          prompt: "Which areas of the system are least trusted by employees or stakeholders?",
          type: "textarea",
          placeholder: "Data, timelines, handoffs, decisions, reporting, capacity..."
        }
      ]
    },
    {
      id: "stress",
      title: "Stress Patterns",
      kicker: "Identify what fails under pressure.",
      fields: [
        {
          id: "repeatedFailure",
          label: "Repeated Failure",
          prompt: "What errors, delays, or operational failures repeatedly reappear despite attempts to fix them?",
          type: "textarea",
          placeholder: "Name the issues that come back after temporary fixes."
        },
        {
          id: "exceptionRate",
          label: "Exception Rate",
          prompt: "What percentage of work follows the standard process without requiring exceptions, clarification, escalation, or special handling?",
          type: "select",
          options: exceptionRateOptions
        },
        {
          id: "systemStress",
          label: "System Stress",
          prompt: "When volume, urgency, or complexity increases, where does the system begin to break down first?",
          type: "textarea",
          placeholder: "Describe the first pressure points that show strain."
        },
        {
          id: "trustDrivers",
          label: "Trust Drivers",
          prompt: "What would make this system feel calmer, more predictable, or easier to trust?",
          type: "textarea",
          placeholder: "Name the shifts, controls, rhythms, or visibility people need."
        }
      ]
    },
    {
      id: "aiReadiness",
      title: "AI Readiness & Governance",
      kicker: "Assess operational coherence for safe AI adoption.",
      condition: (values) => values.diagnosticPath === "ai_readiness",
      fields: [
        {
          id: "aiCurrentUse",
          label: "Current AI Use",
          prompt: "Where is AI currently being used in the organization?",
          type: "textarea",
          placeholder: "Describe known AI tools, use cases, teams, vendors, pilots, or informal adoption."
        },
        {
          id: "aiApprovedTools",
          label: "Approved Tools",
          prompt: "Are there approved AI tools or sanctioned use cases?",
          type: "textarea",
          placeholder: "List sanctioned tools, approved workflows, policies, or known restrictions."
        },
        {
          id: "aiShadowUse",
          label: "Shadow AI Use",
          prompt: "Are teams likely using AI tools outside formal visibility or approval?",
          type: "scale",
          lowLabel: "1 = not likely",
          highLabel: "5 = very likely",
          options: scaleOptions
        },
        {
          id: "aiSensitiveDataExposure",
          label: "Sensitive Data Exposure",
          prompt: "Could AI tools interact with sensitive, regulated, patient, customer, employee, financial, legal, or proprietary data?",
          type: "scale",
          lowLabel: "1 = no meaningful exposure",
          highLabel: "5 = significant exposure",
          options: scaleOptions
        },
        {
          id: "aiWorkflowClarity",
          label: "Workflow Clarity",
          prompt: "Are the workflows targeted for AI clear, stable, and consistently followed today?",
          type: "scale",
          lowLabel: "1 = unclear / inconsistent",
          highLabel: "5 = clear / stable",
          options: scaleOptions
        },
        {
          id: "aiClassificationConsistency",
          label: "Classification Consistency",
          prompt: "Would different reviewers classify the same AI use case or AI vendor the same way?",
          type: "scale",
          lowLabel: "1 = highly inconsistent",
          highLabel: "5 = highly consistent",
          options: scaleOptions
        },
        {
          id: "aiValidationExpectations",
          label: "Validation Expectations",
          prompt: "Are expectations clear for how humans validate AI-generated summaries, recommendations, decisions, or outputs?",
          type: "scale",
          lowLabel: "1 = unclear",
          highLabel: "5 = very clear",
          options: scaleOptions
        },
        {
          id: "aiAccountabilityClarity",
          label: "Accountability Clarity",
          prompt: "Is it clear who is accountable when AI-assisted work produces an error or poor decision?",
          type: "scale",
          lowLabel: "1 = unclear",
          highLabel: "5 = very clear",
          options: scaleOptions
        },
        {
          id: "aiGovernanceOwnership",
          label: "Governance Ownership",
          prompt: "Who owns AI governance decisions today?",
          type: "textarea",
          placeholder: "Name the roles, committees, teams, or decision forums involved."
        },
        {
          id: "aiEscalationRules",
          label: "Escalation Rules",
          prompt: "Are there clear rules for when AI use requires escalation, legal review, security review, compliance review, or executive approval?",
          type: "scale",
          lowLabel: "1 = unclear",
          highLabel: "5 = very clear",
          options: scaleOptions
        },
        {
          id: "aiAutomationTargets",
          label: "Automation Targets",
          prompt: "What workflows, decisions, or processes does leadership want to automate or augment with AI?",
          type: "textarea",
          placeholder: "Describe the automation or augmentation ambitions leadership is considering."
        },
        {
          id: "aiAmplificationVisibleProblem",
          label: "AI Amplification Question 1",
          prompt: "If AI accelerated this workflow by 50% tomorrow, what problem would become visible first?",
          type: "textarea",
          placeholder: "Name the bottleneck, ambiguity, dependency, or failure pattern that speed would expose."
        },
        {
          id: "aiHumanJudgmentStabilizers",
          label: "AI Amplification Question 2",
          prompt: "What human judgment currently prevents mistakes, escalation, or rework?",
          type: "textarea",
          placeholder: "Describe the judgment calls, informal checks, or human corrections holding the workflow together."
        },
        {
          id: "aiTrustWithoutVerificationRisk",
          label: "AI Amplification Question 3",
          prompt: "What work would become riskier if employees trusted AI outputs without verification?",
          type: "textarea",
          placeholder: "Identify decisions, communications, handoffs, summaries, or routing that require validation."
        },
        {
          id: "aiLeadershipAutomationBeliefs",
          label: "AI Amplification Question 4",
          prompt: "Which current operational frustrations does leadership believe AI will solve?",
          type: "textarea",
          placeholder: "List the pain points leadership expects AI to fix, automate, or reduce."
        },
        {
          id: "aiDecisionJudgment",
          label: "AI Decision Question",
          prompt: "Which decisions in this workflow currently depend on experience, interpretation, or judgment rather than explicit rules?",
          type: "textarea",
          placeholder: "Name the decisions where people rely on judgment, context, experience, or interpretation."
        },
        {
          id: "aiReviewerVariance",
          label: "AI Reviewer Variance",
          prompt: "How often would two qualified reviewers reach different conclusions when reviewing the same AI use case, vendor, or AI-assisted workflow?",
          type: "scale",
          lowLabel: "1 = Almost never",
          highLabel: "5 = Very often",
          options: scaleOptions
        },
        {
          id: "aiWorkaroundDependence",
          label: "Workaround Dependence",
          prompt: "Do current workflows depend on manual workarounds, tribal knowledge, side channels, or human correction?",
          type: "scale",
          lowLabel: "1 = minimal dependence",
          highLabel: "5 = heavy dependence",
          options: scaleOptions
        },
        {
          id: "aiRecoverability",
          label: "Recoverability",
          prompt: "If AI creates an error, poor recommendation, incorrect routing, or misleading output, how quickly could the organization detect and correct it?",
          type: "scale",
          lowLabel: "1 = difficult to detect/correct",
          highLabel: "5 = quickly detectable/correctable",
          options: scaleOptions
        },
        {
          id: "aiTrustClimate",
          label: "Trust Climate",
          prompt: "Do employees feel comfortable questioning, validating, or rejecting AI-generated outputs?",
          type: "scale",
          lowLabel: "1 = no / unclear",
          highLabel: "5 = yes / strongly",
          options: scaleOptions
        },
        {
          id: "aiDependencyQuestion",
          label: "AI Dependency",
          prompt: "If AI-generated outputs disappeared tomorrow, how disrupted would current work be?",
          type: "select",
          options: dependencyOptions
        }
      ]
    },
    {
      id: "review",
      title: "Review & Export",
      kicker: "Package the reality map for analysis.",
      fields: []
    }
  ];

  const allFields = steps.flatMap((step) =>
    step.fields.map((field) => ({ ...field, stepId: step.id, stepTitle: step.title }))
  );

  const blankValues = allFields.reduce((values, field) => {
    values[field.id] = field.defaultValue || "";
    return values;
  }, {});

  function visibleStepsFor(values) {
    return steps.filter((step) => !step.condition || step.condition(values));
  }

  function visibleFieldsFor(values) {
    return visibleStepsFor(values).flatMap((step) =>
      step.fields.map((field) => ({ ...field, stepId: step.id, stepTitle: step.title }))
    );
  }

  function completionFor(values) {
    const visibleFields = visibleFieldsFor(values);
    const answered = visibleFields.filter((field) => String(values[field.id] || "").trim()).length;
    return {
      answered,
      total: visibleFields.length,
      percent: Math.round((answered / visibleFields.length) * 100)
    };
  }

  function createAssessmentId(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `CP-${year}${month}${day}-${hours}${minutes}${seconds}`;
  }

  function numericValue(value) {
    const number = Number(value);
    return value === "" || value === null || value === undefined || !Number.isFinite(number)
      ? null
      : number;
  }

  function atLeast(value, threshold) {
    const number = numericValue(value);
    return number !== null && number >= threshold;
  }

  function atMost(value, threshold) {
    const number = numericValue(value);
    return number !== null && number <= threshold;
  }

  function scorePositive(value) {
    const number = numericValue(value);
    return number === null ? null : (number - 1) * 25;
  }

  function scoreRisk(value) {
    const number = numericValue(value);
    return number === null ? null : 100 - (number - 1) * 25;
  }

  function readinessStateFor(score) {
    if (score <= 24) {
      return {
        state: "Reactive",
        interpretation: "AI will likely amplify existing instability."
      };
    }

    if (score <= 44) {
      return {
        state: "Fragile",
        interpretation:
          "Limited AI adoption may be possible, but readiness is inconsistent and risk of governance drift is elevated."
      };
    }

    if (score <= 64) {
      return {
        state: "Structured",
        interpretation:
          "AI can likely be deployed in bounded use cases if governance, validation, and workflow controls are clarified."
      };
    }

    if (score <= 84) {
      return {
        state: "Coherent",
        interpretation:
          "The organization has enough operational structure to scale AI intentionally across selected workflows."
      };
    }

    return {
      state: "Adaptive",
      interpretation:
        "AI can function as a force multiplier because governance, workflow clarity, recoverability, and trust are mature."
    };
  }

  function currentUseIndicatesInformalUse(text) {
    return /informal|unapproved|unsanctioned|shadow|personal|chatgpt|outside|ad hoc|unofficial/i.test(
      text || ""
    );
  }

  function hasText(value) {
    return Boolean(String(value || "").trim());
  }

  function containsAny(value, words) {
    const text = String(value || "").toLowerCase();
    return words.some((word) => text.includes(word));
  }

  function textSignalScore(value) {
    const text = String(value || "").trim();
    if (!text) return 0;
    return text.length > 120 ? 2 : 1;
  }

  function exceptionRisk(value) {
    const scores = {
      "90-100": 0,
      "70-89": 1,
      "50-69": 2,
      "30-49": 3,
      "below-30": 4
    };
    return scores[value] || 0;
  }

  function realityGapCategory(score) {
    if (score <= 2) return "Low";
    if (score <= 5) return "Moderate";
    if (score <= 8) return "Moderate-High";
    if (score <= 11) return "High";
    return "Severe";
  }

  function createContradictionFlags(values) {
    const flags = [];
    const addFlag = (contradictionName, supportingSignals, interpretation) => {
      flags.push({ contradictionName, supportingSignals, interpretation });
    };

    if (
      atLeast(values.aiWorkflowClarity, 4) &&
      atLeast(values.aiWorkaroundDependence, 4)
    ) {
      addFlag(
        "Workflow Clarity / Workaround Dependence Mismatch",
        ["AI workflow clarity is rated high", "AI workaround dependence is rated high"],
        "The workflow may appear clear at the policy level while still depending on informal correction, side channels, or compensatory human stabilization."
      );
    }

    if (
      atLeast(values.aiEscalationRules, 4) &&
      atMost(values.aiAccountabilityClarity, 2)
    ) {
      addFlag(
        "Escalation Rules / Accountability Gap",
        ["AI escalation rules are rated high", "AI accountability clarity is rated low"],
        "Escalation pathways may exist without clear ownership for AI-assisted errors, routing, communication, or downstream decisions."
      );
    }

    if (
      atLeast(values.aiTrustClimate, 4) &&
      atMost(values.aiValidationExpectations, 2)
    ) {
      addFlag(
        "Trust Climate / Validation Ambiguity",
        ["AI trust climate is rated high", "AI validation expectations are rated low"],
        "Employees may feel comfortable using AI outputs without having consistent validation rules, increasing false-confidence risk."
      );
    }

    if (
      containsAny(values.aiApprovedTools, ["none", "no approved", "not approved", "no sanctioned"]) &&
      atLeast(values.aiShadowUse, 4)
    ) {
      addFlag(
        "No Approved Tools / High Shadow AI Risk",
        ["Approved AI tools appear absent", "Shadow AI likelihood is high"],
        "AI adoption may be occurring through invisible or unsanctioned channels before governance has defined safe use boundaries."
      );
    }

    if (
      containsAny(values.symptoms, ["sla", "late", "delay", "waiting", "slow"]) &&
      !hasText(values.delayWaiting)
    ) {
      addFlag(
        "SLA Frustration / Missing Delay Description",
        ["Visible symptoms mention time, delay, or SLA pressure", "Delay and waiting detail is blank"],
        "The assessment signals time-based frustration but has not exposed where waiting, queues, or follow-up burden actually occur."
      );
    }

    if (
      containsAny(`${values.strategicAim} ${values.primarySystem}`, [
        "standardized",
        "standard",
        "consistent",
        "repeatable"
      ]) &&
      ["50-69", "30-49", "below-30"].includes(values.exceptionRate)
    ) {
      addFlag(
        "Standardized System / High Exception Rate",
        ["The system is described as standardized or repeatable", "Exception rate indicates less than 70% follows the standard process"],
        "The formal process narrative may be overstating consistency relative to how work actually gets handled."
      );
    }

    return flags;
  }

  function detectGoverningDynamics(values) {
    const dynamics = [];
    const add = (dynamic, condition) => {
      if (condition && !dynamics.includes(dynamic)) dynamics.push(dynamic);
    };

    add("escalation-governed", hasText(values.escalationPatterns) || hasText(values.priorityEscalation));
    add("coordination-governed", hasText(values.coordinationBurden));
    add("interruption-governed", hasText(values.interruptionPatterns));
    add("visibility-governed", hasText(values.trustErosion) || containsAny(values.coordinationBurden, ["status", "visibility", "follow-up", "follow up"]));
    add("ambiguity-governed", hasText(values.ambiguity) || atLeast(values.decisionConsistency, 4));
    add("dependency-governed", hasText(values.dependencyConcentration) || containsAny(`${values.dependencyConcentration} ${values.workarounds}`, ["tribal", "experienced", "only person", "key person", "knowledge"]));
    add("workaround-governed", hasText(values.workarounds));
    add("classification-governed", atLeast(values.decisionConsistency, 4) || atMost(values.aiClassificationConsistency, 2) || atLeast(values.aiReviewerVariance, 4));
    add("governance-governed", containsAny(values.aiGovernanceOwnership, ["unclear", "no owner", "nobody", "unknown"]) || atMost(values.aiEscalationRules, 2));

    return dynamics;
  }

  function classifyStabilityState(values, gapCategory, dynamics) {
    const highWorkaround = hasText(values.workarounds) || atLeast(values.aiWorkaroundDependence, 4);
    const highDependency = hasText(values.dependencyConcentration);
    const highCoordination = hasText(values.coordinationBurden);
    const highEscalation = hasText(values.escalationPatterns) || hasText(values.priorityEscalation);
    const lowTrust = hasText(values.trustErosion) || atMost(values.aiTrustClimate, 2);
    const unclearWorkflow = hasText(values.ambiguity) || atMost(values.aiWorkflowClarity, 2);
    const repeatedFailure = hasText(values.repeatedFailure);
    const lowRecoverability = atMost(values.aiRecoverability, 2);
    const highSensitiveAiRisk = atLeast(values.aiSensitiveDataExposure, 4);
    const inconsistentDecisions = atLeast(values.decisionConsistency, 4) || atLeast(values.aiReviewerVariance, 4);

    if (highWorkaround && highDependency) return "Dependency-Stabilized";
    if (highCoordination && (hasText(values.delayWaiting) || containsAny(values.coordinationBurden, ["clarification", "follow-up", "follow up", "chasing"]))) return "Coordination-Saturated";
    if (highEscalation) return "Escalation-Stabilized";
    if (lowRecoverability && highSensitiveAiRisk) return "Recoverability-Impaired";
    if (lowTrust && unclearWorkflow && repeatedFailure) return "Reactive";
    if (hasText(values.ambiguity) && inconsistentDecisions && (hasText(values.workarounds) || hasText(values.entryPoint))) return "Structurally Fragmented";
    if (gapCategory === "Low" && dynamics.length <= 1) return "Stable";
    return "Fragile";
  }

  function diagnosticConfidence(values, completion, dynamics, contradictionFlags) {
    let score = 0;
    if (completion.percent >= 85) score += 3;
    else if (completion.percent >= 65) score += 2;
    else if (completion.percent >= 45) score += 1;

    const specificityFields = [
      "primarySystem",
      "strategicAim",
      "symptoms",
      "workarounds",
      "dependencyConcentration",
      "ambiguity",
      "repeatedFailure",
      "aiCurrentUse",
      "aiDecisionJudgment",
      "aiAmplificationVisibleProblem"
    ];
    const specificAnswers = specificityFields.filter((field) => textSignalScore(values[field]) >= 2).length;
    if (specificAnswers >= 5) score += 2;
    else if (specificAnswers >= 2) score += 1;

    if (dynamics.length >= 4) score += 2;
    else if (dynamics.length >= 2) score += 1;

    if (hasText(values.workarounds) && (atLeast(values.aiWorkaroundDependence, 4) || hasText(values.aiDecisionJudgment))) score += 1;
    if (!hasText(values.primarySystem) || !hasText(values.strategicAim)) score -= 1;
    if (contradictionFlags.length >= 3) score -= 2;
    else if (contradictionFlags.length) score -= 1;

    if (score >= 6) return "High";
    if (score >= 4) return "Moderate-High";
    if (score >= 2) return "Moderate";
    return "Low";
  }

  function createDerivedDiagnostics(values) {
    const gapSignals = [
      textSignalScore(values.workarounds),
      textSignalScore(values.dependencyConcentration),
      textSignalScore(values.ambiguity),
      Math.max(0, numericValue(values.decisionConsistency) - 2 || 0),
      textSignalScore(values.trustErosion),
      textSignalScore(values.repeatedFailure),
      numericValue(values.aiWorkflowClarity) ? Math.max(0, 4 - numericValue(values.aiWorkflowClarity)) : 0,
      numericValue(values.aiWorkaroundDependence) ? Math.max(0, numericValue(values.aiWorkaroundDependence) - 2) : 0,
      textSignalScore(values.aiDecisionJudgment),
      Math.max(0, numericValue(values.aiReviewerVariance) - 2 || 0),
      exceptionRisk(values.exceptionRate)
    ];
    const operationalRealityGapScore = gapSignals.reduce((sum, signal) => sum + signal, 0);
    const operationalRealityGap = realityGapCategory(operationalRealityGapScore);
    const governingDynamics = detectGoverningDynamics(values);
    const contradictionFlags = createContradictionFlags(values);
    const completion = completionFor(values);
    const stabilityState = classifyStabilityState(values, operationalRealityGap, governingDynamics);

    return {
      stabilityState,
      governingDynamics,
      primaryGoverningDynamic: governingDynamics[0] || "none-detected",
      operationalRealityGap,
      operationalRealityGapScore,
      operationalRealityGapInterpretation:
        "This measures the distance between formal process design and how work actually gets done.",
      diagnosticConfidence: diagnosticConfidence(values, completion, governingDynamics, contradictionFlags),
      contradictionFlags,
      primaryOutputEmphasis: [
        "stabilityState",
        "governingDynamics",
        "operationalRealityGap",
        "aiAmplificationRisk",
        "recommendedClearpathStage"
      ],
      reportStructure: [
        "Executive Summary",
        "Stability State Classification",
        "Visible Symptoms",
        "Hidden Operational Conditions",
        "Primary CLEARPATH Diagnosis",
        "Governing Dynamic",
        "SEDRI Stage Assessment",
        "Operational Severity Map",
        "Operational Reality Gap",
        "AI Readiness Profile",
        "AI Governance Risk Conditions",
        "AI Decision Architecture Risk",
        "Likely Business Impact",
        "Executive Blind Spots",
        "Hidden Dependency Nodes",
        "Contradiction Flags",
        "Highest-Leverage Stabilization Point",
        "Top 3 Stabilization Priorities",
        "What Not To Do Yet",
        "30-Day Action Plan",
        "Executive Narrative",
        "Diagnostic Confidence",
        "Additional Exposure Needed"
      ]
    };
  }

  function triggeredCondition(name, triggered, output) {
    return triggered ? { name, output } : null;
  }

  function recommendedStageFor(values) {
    if (
      atMost(values.aiValidationExpectations, 2) ||
      atMost(values.aiAccountabilityClarity, 2) ||
      atMost(values.aiEscalationRules, 2)
    ) {
      return "Stabilize";
    }

    if (
      atLeast(values.aiShadowUse, 4) ||
      atLeast(values.aiWorkaroundDependence, 4) ||
      currentUseIndicatesInformalUse(values.aiCurrentUse)
    ) {
      return "Expose";
    }

    if (
      atMost(values.aiClassificationConsistency, 2) ||
      atMost(values.aiWorkflowClarity, 2) ||
      atLeast(values.aiReviewerVariance, 4)
    ) {
      return "Diagnose";
    }

    if (
      atLeast(values.aiWorkflowClarity, 4) &&
      atLeast(values.aiClassificationConsistency, 3) &&
      atLeast(values.aiValidationExpectations, 3)
    ) {
      return "Redesign";
    }

    return "Institutionalize";
  }

  function createAiReadiness(values) {
    if (values.diagnosticPath !== "ai_readiness") {
      return null;
    }

    const positiveScores = [
      "aiWorkflowClarity",
      "aiClassificationConsistency",
      "aiValidationExpectations",
      "aiAccountabilityClarity",
      "aiEscalationRules",
      "aiRecoverability",
      "aiTrustClimate"
    ].map((id) => scorePositive(values[id]));
    const riskScores = [
      "aiShadowUse",
      "aiSensitiveDataExposure",
      "aiWorkaroundDependence"
    ].map((id) => scoreRisk(values[id]));
    const normalizedScores = positiveScores.concat(riskScores).filter((score) => score !== null);
    const score = normalizedScores.length
      ? Math.round(
          normalizedScores.reduce((sum, nextScore) => sum + nextScore, 0) /
            normalizedScores.length
        )
      : null;
    const state = score === null ? null : readinessStateFor(score);
    const riskConditions = [
      triggeredCondition(
        "Shadow AI Risk",
        atLeast(values.aiShadowUse, 4) ||
          currentUseIndicatesInformalUse(values.aiCurrentUse),
        "AI adoption may already be occurring outside formal visibility. The organization should expose actual AI usage before expanding governance controls."
      ),
      triggeredCondition(
        "Classification Instability",
        atMost(values.aiClassificationConsistency, 2),
        "AI governance risk is elevated because similar AI use cases may be classified differently across reviewers, teams, or departments."
      ),
      triggeredCondition(
        "Validation Ambiguity",
        atMost(values.aiValidationExpectations, 2),
        "Human-AI trust boundaries are unclear. Teams may over-trust, under-trust, or inconsistently validate AI-generated outputs."
      ),
      triggeredCondition(
        "Accountability Gap",
        atMost(values.aiAccountabilityClarity, 2),
        "AI-assisted work lacks clear accountability. This increases risk when outputs influence decisions, routing, communication, or operational action."
      ),
      triggeredCondition(
        "Automation Readiness Gap",
        atMost(values.aiWorkflowClarity, 2) ||
          atLeast(values.aiWorkaroundDependence, 4),
        "Automation risk is elevated because current workflows appear unstable, workaround-dependent, or inconsistently understood."
      ),
      triggeredCondition(
        "Sensitive Data Exposure",
        atLeast(values.aiSensitiveDataExposure, 4),
        "AI use may involve sensitive or regulated data. Governance should clarify data boundaries, approved use cases, and review requirements before scaling adoption."
      ),
      triggeredCondition(
        "Recoverability Deficit",
        atMost(values.aiRecoverability, 2),
        "The organization may struggle to detect and correct AI-related errors before they propagate downstream."
      ),
      triggeredCondition(
        "Trust Climate Risk",
        atMost(values.aiTrustClimate, 2),
        "Employees may not feel safe or empowered to challenge AI-generated outputs, which increases the risk of false confidence and poor validation behavior."
      ),
      triggeredCondition(
        "AI Decision Architecture Risk",
        atLeast(values.aiReviewerVariance, 4) || hasText(values.aiDecisionJudgment),
        "AI use may be entering decision spaces that depend on experience, interpretation, or reviewer judgment rather than explicit operating rules."
      )
    ].filter(Boolean);

    return {
      answers: {
        aiCurrentUse: values.aiCurrentUse.trim(),
        aiApprovedTools: values.aiApprovedTools.trim(),
        aiShadowUse: values.aiShadowUse,
        aiSensitiveDataExposure: values.aiSensitiveDataExposure,
        aiWorkflowClarity: values.aiWorkflowClarity,
        aiClassificationConsistency: values.aiClassificationConsistency,
        aiValidationExpectations: values.aiValidationExpectations,
        aiAccountabilityClarity: values.aiAccountabilityClarity,
        aiGovernanceOwnership: values.aiGovernanceOwnership.trim(),
        aiEscalationRules: values.aiEscalationRules,
        aiAutomationTargets: values.aiAutomationTargets.trim(),
        aiAmplificationVisibleProblem: values.aiAmplificationVisibleProblem.trim(),
        aiHumanJudgmentStabilizers: values.aiHumanJudgmentStabilizers.trim(),
        aiTrustWithoutVerificationRisk: values.aiTrustWithoutVerificationRisk.trim(),
        aiLeadershipAutomationBeliefs: values.aiLeadershipAutomationBeliefs.trim(),
        aiDecisionJudgment: values.aiDecisionJudgment.trim(),
        aiReviewerVariance: values.aiReviewerVariance,
        aiWorkaroundDependence: values.aiWorkaroundDependence,
        aiRecoverability: values.aiRecoverability,
        aiTrustClimate: values.aiTrustClimate,
        aiDependencyQuestion: values.aiDependencyQuestion
      },
      score,
      state: state ? state.state : "Incomplete",
      interpretation: state
        ? state.interpretation
        : "Complete the AI Readiness scale fields to calculate a readiness profile.",
      riskConditions,
      operationalReadinessInterpretation:
        "Analyze what AI is likely to amplify in the current system: ambiguity, hidden work, governance drift, classification inconsistency, workflow fragmentation, human validation burden, escalation behavior, and trust instability.",
      interpretationLayers: {
        aiGovernance: {
          focus: "Approved tools, ownership, escalation rules, and accountability.",
          signals: {
            approvedTools: values.aiApprovedTools.trim(),
            governanceOwnership: values.aiGovernanceOwnership.trim(),
            escalationRules: values.aiEscalationRules,
            accountabilityClarity: values.aiAccountabilityClarity
          }
        },
        operationalAiReadiness: {
          focus: "Workflow clarity, workaround dependence, recoverability, and validation expectations.",
          signals: {
            workflowClarity: values.aiWorkflowClarity,
            workaroundDependence: values.aiWorkaroundDependence,
            recoverability: values.aiRecoverability,
            validationExpectations: values.aiValidationExpectations
          }
        },
        aiAmplificationRisk: {
          focus: "What AI would expose first, hidden human stabilizers, trust-without-verification risk, and leadership automation beliefs.",
          signals: {
            visibleProblem: values.aiAmplificationVisibleProblem.trim(),
            humanJudgmentStabilizers: values.aiHumanJudgmentStabilizers.trim(),
            trustWithoutVerificationRisk: values.aiTrustWithoutVerificationRisk.trim(),
            leadershipAutomationBeliefs: values.aiLeadershipAutomationBeliefs.trim()
          }
        },
        decisionArchitecture: {
          focus: "Experience-based decisions, reviewer variance, classification consistency, and policy-reality gaps.",
          signals: {
            decisionJudgment: values.aiDecisionJudgment.trim(),
            reviewerVariance: values.aiReviewerVariance,
            classificationConsistency: values.aiClassificationConsistency,
            policyRealityGap:
              "Compare formal AI governance claims against workaround dependence, hidden usage, decision variance, and validation ambiguity."
          }
        }
      },
      automationGuardrails: [
        "Do not recommend broad AI automation if workflows are unclear.",
        "Do not recommend broad AI automation if workaround dependence is high.",
        "Do not recommend broad AI automation if reviewer variance is high.",
        "Do not recommend broad AI automation if accountability is unclear.",
        "Do not recommend broad AI automation if validation expectations are weak.",
        "Do not recommend broad AI automation if sensitive data exposure is high."
      ],
      recommendedClearpathStage: recommendedStageFor(values),
      thirtyDayPlan: [
        {
          week: "Week 1",
          action: "Expose current AI usage, tools, use cases, and hidden adoption."
        },
        {
          week: "Week 2",
          action:
            "Classify AI use cases by data exposure, decision impact, autonomy, and workflow dependency."
        },
        {
          week: "Week 3",
          action:
            "Clarify validation rules, escalation rules, accountability, and approved use boundaries."
        },
        {
          week: "Week 4",
          action:
            "Select one bounded AI use case for controlled implementation or governance redesign."
        }
      ],
      diagnosticGptInstructionAddition:
        "When the submitted assessment includes diagnosticPath = ai_readiness or includes aiReadiness fields, analyze AI readiness through the CLEARPATH lens. Do not treat AI readiness as simple technology maturity. Treat it as operational coherence under accelerating complexity. Evaluate whether AI will amplify workflow instability, hidden work, shadow systems, classification inconsistency, governance ambiguity, escalation inflation, human validation burden, decision accountability gaps, recoverability limits, and trust instability. Do not recommend broad AI automation if workflows are unstable, classification is inconsistent, accountability is unclear, or validation expectations are undefined. Always preserve CLEARPATH sequencing: Stabilize -> Expose -> Diagnose -> Redesign -> Institutionalize. The AI readiness output should sound like CLEARPATH structural diagnostic intelligence, not generic AI consulting advice."
    };
  }

  function createExportPayload(values, respondent, assessmentId) {
    const aiReadiness = createAiReadiness(values);
    const derivedDiagnostics = createDerivedDiagnostics(values);

    return {
      assessmentId,
      assessment: "CLEARPATH Operational Reality Assessment",
      version: "1.0",
      generatedAt: new Date().toISOString(),
      submittedAt: null,
      diagnosticPath: values.diagnosticPath,
      respondent: {
        name: respondent.name.trim(),
        organization: respondent.organization.trim(),
        email: respondent.email.trim()
      },
      completion: completionFor(values),
      responses: visibleStepsFor(values)
        .filter((step) => step.fields.length)
        .map((step) => ({
          section: step.title,
          answers: step.fields.map((field) => ({
            id: field.id,
            label: field.label,
            question: field.prompt,
            response: String(values[field.id] || "").trim()
          }))
        })),
      derivedDiagnostics,
      aiReadiness
    };
  }

  function App() {
    const [activeStep, setActiveStep] = useState(0);
    const [values, setValues] = useState(() => {
      try {
        return { ...blankValues, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
      } catch (error) {
        return blankValues;
      }
    });
    const [copyState, setCopyState] = useState("Copy GPT payload");
    const [assessmentId, setAssessmentId] = useState(() => {
      const savedId = localStorage.getItem(ASSESSMENT_ID_KEY);

      if (savedId) {
        return savedId;
      }

      const nextId = createAssessmentId();
      localStorage.setItem(ASSESSMENT_ID_KEY, nextId);
      return nextId;
    });
    const [respondent, setRespondent] = useState(() => {
      try {
        return {
          name: "",
          organization: "",
          email: "",
          ...JSON.parse(localStorage.getItem(RESPONDENT_KEY))
        };
      } catch (error) {
        return { name: "", organization: "", email: "" };
      }
    });
    const [sheetsEndpoint, setSheetsEndpoint] = useState(() => {
      return configuredEndpoint || localStorage.getItem(ENDPOINT_KEY) || "";
    });
    const [submitState, setSubmitState] = useState("idle");
    const [submitMessage, setSubmitMessage] = useState("");

    useEffect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    }, [values]);

    useEffect(() => {
      localStorage.setItem(RESPONDENT_KEY, JSON.stringify(respondent));
    }, [respondent]);

    useEffect(() => {
      if (!configuredEndpoint) {
        localStorage.setItem(ENDPOINT_KEY, sheetsEndpoint);
      }
    }, [sheetsEndpoint]);

    const completion = useMemo(() => completionFor(values), [values]);
    const payload = useMemo(
      () => createExportPayload(values, respondent, assessmentId),
      [values, respondent, assessmentId]
    );
    const currentSteps = visibleStepsFor(values);
    const active = currentSteps[activeStep] || currentSteps[currentSteps.length - 1];
    const stepAnswered = active.fields.filter((field) =>
      String(values[field.id] || "").trim()
    ).length;
    const stepPercent = active.fields.length
      ? Math.round((stepAnswered / active.fields.length) * 100)
      : completion.percent;

    useEffect(() => {
      if (activeStep >= currentSteps.length) {
        setActiveStep(currentSteps.length - 1);
      }
    }, [activeStep, currentSteps.length]);

    function updateField(id, nextValue) {
      setValues((current) => ({ ...current, [id]: nextValue }));
    }

    function goToStep(index) {
      setActiveStep(Math.max(0, Math.min(currentSteps.length - 1, index)));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function copyPayload() {
      const text = JSON.stringify(payload, null, 2);
      try {
        await navigator.clipboard.writeText(text);
        setCopyState("Copied");
        window.setTimeout(() => setCopyState("Copy GPT payload"), 1600);
      } catch (error) {
        setCopyState("Select JSON below");
      }
    }

    function downloadPayload() {
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "clearpath-operational-reality-assessment.json";
      link.click();
      URL.revokeObjectURL(url);
    }

    function clearAll() {
      const confirmed = window.confirm(
        "Clear this intake and start a new assessment ID?"
      );
      if (confirmed) {
        setValues(blankValues);
        setRespondent({ name: "", organization: "", email: "" });
        const nextId = createAssessmentId();
        localStorage.setItem(ASSESSMENT_ID_KEY, nextId);
        setAssessmentId(nextId);
        setSubmitState("idle");
        setSubmitMessage("");
        setCopyState("Copy GPT payload");
        setActiveStep(0);
      }
    }

    async function submitToSheets() {
      if (!sheetsEndpoint.trim()) {
        setSubmitState("error");
        setSubmitMessage("Add your Google Apps Script web app URL before submitting.");
        return;
      }

      setSubmitState("sending");
      setSubmitMessage("Sending assessment to Google Sheets...");

      try {
        await fetch(sheetsEndpoint.trim(), {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify({
            ...payload,
            submittedAt: new Date().toISOString()
          })
        });
        setSubmitState("success");
        setSubmitMessage("Submitted to Google Sheets. You can safely close this intake.");
      } catch (error) {
        setSubmitState("error");
        setSubmitMessage("Submission failed. Check the endpoint URL and try again.");
      }
    }

    return h(
      "main",
      { className: "app-shell" },
      h(Header, { completion, clearAll }),
      h(
        "section",
        { className: "workspace" },
        h(StepRail, { activeStep, completion, goToStep, values, currentSteps }),
        h(
          "div",
          { className: "form-panel" },
          h(
            "div",
            { className: "section-head" },
            h("span", { className: "eyebrow" }, active.kicker),
            h("h2", null, active.title),
            h(
              "div",
              { className: "mini-progress", "aria-label": `Current step ${stepPercent}% complete` },
              h("span", { style: { width: `${stepPercent}%` } })
            )
          ),
          active.id === "review"
            ? h(Review, {
                payload,
                values,
                copyPayload,
                copyState,
                downloadPayload,
                clearAll,
                respondent,
                setRespondent,
                sheetsEndpoint,
                setSheetsEndpoint,
                submitState,
                submitMessage,
                submitToSheets,
                configuredEndpoint,
                assessmentId
              })
            : h(FormStep, { fields: active.fields, values, updateField }),
          h(
            "div",
            { className: "form-actions" },
            h(
              "button",
              {
                className: "button ghost",
                onClick: () => goToStep(activeStep - 1),
                disabled: activeStep === 0
              },
              "Back"
            ),
            h(
              "button",
              {
                className: "button primary",
                onClick: () => goToStep(activeStep + 1),
                disabled: activeStep === currentSteps.length - 1
              },
              activeStep === currentSteps.length - 2 ? "Review" : "Next"
            )
          )
        )
      )
    );
  }

  function Header({ completion, clearAll }) {
    return h(
      "header",
      { className: "hero" },
      h("img", {
        className: "brand-mark",
        src: "./assets/clearpath-logo.jpeg",
        alt: "CLEARPATH logo"
      }),
      h(
        "div",
        { className: "hero-copy" },
        h("p", { className: "label" }, "Operational Reality Assessment"),
        h("h1", null, "CLEARPATH"),
        h(
          "p",
          { className: "intro" },
          "A guided intake for mapping friction, delay, ambiguity, and stress patterns before GPT-assisted analysis."
        )
      ),
      h(
        "div",
        { className: "completion-card" },
        h("span", null, "Overall progress"),
        h("strong", null, `${completion.percent}%`),
        h(
          "small",
          null,
          `${completion.answered} of ${completion.total} prompts answered`
        ),
        h("button", { className: "button ghost compact", onClick: clearAll }, "Clear all")
      )
    );
  }

  function StepRail({ activeStep, goToStep, values, currentSteps }) {
    return h(
      "aside",
      { className: "step-rail", "aria-label": "Assessment sections" },
      currentSteps.map((step, index) => {
        const answered = step.fields.filter((field) => values[field.id].trim()).length;
        const done = step.fields.length ? answered === step.fields.length : false;
        return h(
          "button",
          {
            key: step.id,
            className: `step-button ${index === activeStep ? "active" : ""}`,
            onClick: () => goToStep(index)
          },
          h("span", { className: done ? "dot done" : "dot" }, done ? "✓" : index + 1),
          h(
            "span",
            { className: "step-copy" },
            h("strong", null, step.title),
            h(
              "small",
              null,
              step.fields.length ? `${answered}/${step.fields.length} complete` : "Finalize"
            )
          )
        );
      })
    );
  }

  function FormStep({ fields, values, updateField }) {
    return h(
      "div",
      { className: "field-stack" },
      fields.map((field) =>
        h(
          "label",
          { className: "field-card", key: field.id },
          h("span", { className: "field-label" }, field.label),
          h("span", { className: "field-prompt" }, field.prompt),
          field.type === "text"
            ? h("input", {
                value: values[field.id],
                onChange: (event) => updateField(field.id, event.target.value),
                placeholder: field.placeholder
              })
            : field.type === "select"
              ? h(
                  "select",
                  {
                    value: values[field.id],
                    onChange: (event) => updateField(field.id, event.target.value)
                  },
                  field.options.map((option) =>
                    h("option", { key: option.value, value: option.value }, option.label)
                  )
                )
              : field.type === "scale"
                ? h(
                    "div",
                    { className: "scale-field" },
                    h("span", null, field.lowLabel),
                    h(
                      "div",
                      { className: "scale-options" },
                      field.options.map((option) =>
                        h(
                          "button",
                          {
                            key: option.value,
                            type: "button",
                            className:
                              values[field.id] === option.value
                                ? "scale-button active"
                                : "scale-button",
                            onClick: () => updateField(field.id, option.value)
                          },
                          option.label
                        )
                      )
                    ),
                    h("span", null, field.highLabel)
                  )
                : h("textarea", {
                    value: values[field.id],
                    onChange: (event) => updateField(field.id, event.target.value),
                    placeholder: field.placeholder,
                    rows: 5
                  })
        )
      )
    );
  }

  function Review({
    payload,
    values,
    copyPayload,
    copyState,
    downloadPayload,
    clearAll,
    respondent,
    setRespondent,
    sheetsEndpoint,
    setSheetsEndpoint,
    submitState,
    submitMessage,
    submitToSheets,
    configuredEndpoint,
    assessmentId
  }) {
    function updateRespondent(key, value) {
      setRespondent((current) => ({ ...current, [key]: value }));
    }

    return h(
      "div",
      { className: "review-grid" },
      h(
        "div",
        { className: "review-list" },
        steps
          .filter((step) => !step.condition || step.condition(values))
          .filter((step) => step.fields.length)
          .map((step) =>
            h(
              "section",
              { className: "summary-section", key: step.id },
              h("h3", null, step.title),
              step.fields.map((field) =>
                h(
                  "article",
                  { className: "summary-item", key: field.id },
                  h("strong", null, field.label),
                  h(
                    "p",
                    null,
                    values[field.id].trim() || "No response entered."
                  )
                )
              )
            )
          )
      ),
      h(
        "aside",
        { className: "export-card" },
        h("h3", null, "Submit & export"),
        h(
          "div",
          { className: "assessment-id-card" },
          h("span", null, "Assessment ID"),
          h("strong", null, assessmentId)
        ),
        h(
          "p",
          null,
          "Send the intake to Google Sheets, or copy/download the same structured payload for your custom GPT."
        ),
        payload.aiReadiness ? h(AiReadinessPreview, { aiReadiness: payload.aiReadiness }) : null,
        h(
          "div",
          { className: "respondent-fields" },
          h("input", {
            value: respondent.name,
            onChange: (event) => updateRespondent("name", event.target.value),
            placeholder: "Respondent name"
          }),
          h("input", {
            value: respondent.organization,
            onChange: (event) => updateRespondent("organization", event.target.value),
            placeholder: "Organization or team"
          }),
          h("input", {
            value: respondent.email,
            onChange: (event) => updateRespondent("email", event.target.value),
            placeholder: "Email"
          })
        ),
        h(
          "label",
          { className: "endpoint-field" },
          h("span", null, "Google Sheets endpoint"),
          h("input", {
            value: sheetsEndpoint,
            onChange: (event) => setSheetsEndpoint(event.target.value),
            placeholder: "Paste Apps Script web app URL",
            readOnly: Boolean(configuredEndpoint)
          })
        ),
        h(
          "button",
          {
            className: "button primary full",
            onClick: submitToSheets,
            disabled: submitState === "sending"
          },
          submitState === "sending" ? "Submitting..." : "Submit to Google Sheets"
        ),
        submitMessage
          ? h("p", { className: `submit-message ${submitState}` }, submitMessage)
          : null,
        h(
          "div",
          { className: "export-divider" },
          h("span", null, "Manual export")
        ),
        h(
          "div",
          { className: "export-actions" },
          h("button", { className: "button primary", onClick: copyPayload }, copyState),
          h("button", { className: "button ghost", onClick: downloadPayload }, "Download JSON"),
          h("button", { className: "button subtle", onClick: clearAll }, "Clear all")
        ),
        h("textarea", {
          className: "json-output",
          readOnly: true,
          value: JSON.stringify(payload, null, 2),
          rows: 18
        })
      )
    );
  }

  function AiReadinessPreview({ aiReadiness }) {
    return h(
      "div",
      { className: "ai-preview" },
      h(
        "div",
        { className: "ai-score-row" },
        h(
          "span",
          null,
          aiReadiness.score === null ? "Incomplete" : `${aiReadiness.score}/100`
        ),
        h("strong", null, aiReadiness.state)
      ),
      h("p", null, aiReadiness.interpretation),
      aiReadiness.riskConditions.length
        ? h(
            "ul",
            null,
            aiReadiness.riskConditions.map((condition) =>
              h("li", { key: condition.name }, condition.name)
            )
          )
        : h("small", null, "No AI governance risk conditions triggered yet.")
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
