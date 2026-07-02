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
          prompt: "Where is the process open to interpretation, and how often does that cause different employees to handle the same situation differently?",
          type: "textarea",
          placeholder: "Describe the unclear rules, judgment calls, or situations where qualified people handle the same case differently."
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
          prompt: "What AI tools are currently being used across the team, both formally approved and informal shadow AI workarounds?",
          type: "textarea",
          placeholder: "Include approved platforms, informal tools, pilots, personal accounts, or known unsanctioned uses."
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
          prompt: "Who owns AI governance decisions today, and are there clear boundaries for when a use case requires legal, security, compliance, or executive approval?",
          type: "textarea",
          placeholder: "Name owners, approval boundaries, review triggers, and unclear decision rights."
        },
        {
          id: "aiAutomationTargets",
          label: "Automation Targets",
          prompt: "What processes does leadership want to automate or augment with AI, and are those workflows stable and consistently followed today?",
          type: "textarea",
          placeholder: "Describe the target workflows and whether they are stable enough for automation."
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
          id: "aiRecoverability",
          label: "Recoverability",
          prompt: "If AI creates an error, poor recommendation, incorrect routing, or misleading output, how quickly could the organization detect and correct it?",
          type: "scale",
          lowLabel: "1 = difficult to detect/correct",
          highLabel: "5 = quickly detectable/correctable",
          options: scaleOptions
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
      containsAny(values.aiAutomationTargets, ["stable", "consistent", "clear"]) &&
      hasText(values.workarounds)
    ) {
      addFlag(
        "Workflow Clarity / Workaround Dependence Mismatch",
        ["AI automation target is described as stable or clear", "Core workflow workarounds are present"],
        "The workflow may appear clear at the policy level while still depending on informal correction, side channels, or compensatory human stabilization."
      );
    }

    if (
      containsAny(values.aiGovernanceOwnership, ["clear", "defined", "approval", "legal", "security"]) &&
      atMost(values.aiAccountabilityClarity, 2)
    ) {
      addFlag(
        "Escalation Rules / Accountability Gap",
        ["AI escalation rules are rated high", "AI accountability clarity is rated low"],
        "Escalation pathways may exist without clear ownership for AI-assisted errors, routing, communication, or downstream decisions."
      );
    }

    if (hasText(values.aiTrustWithoutVerificationRisk) && atMost(values.aiValidationExpectations, 2)) {
      addFlag(
        "Trust Climate / Validation Ambiguity",
        ["Trust-without-verification risk is described", "AI validation expectations are rated low"],
        "Employees may feel comfortable using AI outputs without having consistent validation rules, increasing false-confidence risk."
      );
    }

    if (
      containsAny(values.aiCurrentUse, ["none approved", "no approved", "not approved", "no sanctioned"]) &&
      currentUseIndicatesInformalUse(values.aiCurrentUse)
    ) {
      addFlag(
        "No Approved Tools / High Shadow AI Risk",
        ["Approved AI tools appear absent", "Shadow AI likelihood is high"],
        "AI adoption may be occurring through invisible or unsanctioned channels before governance has defined safe use boundaries."
      );
    }

    if (
      containsAny(`${values.systemStress} ${values.interruptionPatterns}`, ["sla", "late", "delay", "waiting", "slow"]) &&
      !hasText(values.delayWaiting)
    ) {
      addFlag(
        "SLA Frustration / Missing Delay Description",
        ["Stress or interruption detail mentions time, delay, or SLA pressure", "Delay and waiting detail is blank"],
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

    add("escalation-governed", hasText(values.escalationPatterns));
    add("coordination-governed", hasText(values.coordinationBurden));
    add("interruption-governed", hasText(values.interruptionPatterns));
    add("visibility-governed", hasText(values.trustErosion) || containsAny(values.coordinationBurden, ["status", "visibility", "follow-up", "follow up"]));
    add("ambiguity-governed", hasText(values.ambiguity));
    add("dependency-governed", hasText(values.dependencyConcentration) || containsAny(`${values.dependencyConcentration} ${values.workarounds}`, ["tribal", "experienced", "only person", "key person", "knowledge"]));
    add("workaround-governed", hasText(values.workarounds));
    add("classification-governed", containsAny(`${values.ambiguity} ${values.aiDecisionJudgment}`, ["different", "interpretation", "judgment", "classify", "classification", "varies"]));
    add("governance-governed", containsAny(values.aiGovernanceOwnership, ["unclear", "no owner", "nobody", "unknown", "not defined"]));

    return dynamics;
  }

  function classifyStabilityState(values, gapCategory, dynamics) {
    const highWorkaround = hasText(values.workarounds);
    const highDependency = hasText(values.dependencyConcentration);
    const highCoordination = hasText(values.coordinationBurden);
    const highEscalation = hasText(values.escalationPatterns);
    const lowTrust = hasText(values.trustErosion) || hasText(values.aiTrustWithoutVerificationRisk);
    const unclearWorkflow = hasText(values.ambiguity) || containsAny(values.aiAutomationTargets, ["unclear", "unstable", "inconsistent", "not stable", "varies"]);
    const repeatedFailure = hasText(values.repeatedFailure);
    const lowRecoverability = atMost(values.aiRecoverability, 2);
    const highSensitiveAiRisk = atLeast(values.aiSensitiveDataExposure, 4);
    const inconsistentDecisions = containsAny(`${values.ambiguity} ${values.aiDecisionJudgment}`, ["different", "interpretation", "judgment", "varies", "inconsistent"]);

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
      "systemStress",
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

    if (hasText(values.workarounds) && hasText(values.aiDecisionJudgment)) score += 1;
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
      containsAny(values.ambiguity, ["different", "varies", "inconsistent", "interpretation"]) ? 2 : 0,
      textSignalScore(values.trustErosion),
      textSignalScore(values.repeatedFailure),
      containsAny(values.aiAutomationTargets, ["unclear", "unstable", "inconsistent", "not stable", "varies"]) ? 2 : 0,
      hasText(values.workarounds) ? 2 : 0,
      textSignalScore(values.aiDecisionJudgment),
      containsAny(values.aiDecisionJudgment, ["judgment", "interpretation", "experience", "varies", "different"]) ? 2 : 0,
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
      containsAny(values.aiGovernanceOwnership, ["unclear", "no owner", "nobody", "unknown", "not defined"])
    ) {
      return "Stabilize";
    }

    if (
      currentUseIndicatesInformalUse(values.aiCurrentUse) ||
      hasText(values.workarounds)
    ) {
      return "Expose";
    }

    if (
      containsAny(values.aiAutomationTargets, ["unclear", "unstable", "inconsistent", "not stable", "varies"]) ||
      containsAny(values.aiDecisionJudgment, ["judgment", "interpretation", "experience", "different", "varies"])
    ) {
      return "Diagnose";
    }

    if (
      containsAny(values.aiAutomationTargets, ["stable", "consistent", "clear"]) &&
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
      "aiValidationExpectations",
      "aiAccountabilityClarity",
      "aiRecoverability"
    ].map((id) => scorePositive(values[id]));
    const riskScores = [
      "aiSensitiveDataExposure"
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
        currentUseIndicatesInformalUse(values.aiCurrentUse),
        "AI adoption may already be occurring outside formal visibility. The organization should expose actual AI usage before expanding governance controls."
      ),
      triggeredCondition(
        "Classification Instability",
        containsAny(values.aiDecisionJudgment, ["different", "varies", "classification", "interpretation", "judgment"]),
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
        containsAny(values.aiAutomationTargets, ["unclear", "unstable", "inconsistent", "not stable", "varies"]) ||
          hasText(values.workarounds),
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
        hasText(values.aiTrustWithoutVerificationRisk),
        "Employees may over-trust AI-generated outputs in work that still requires judgment, verification, or contextual interpretation."
      ),
      triggeredCondition(
        "AI Decision Architecture Risk",
        hasText(values.aiDecisionJudgment),
        "AI use may be entering decision spaces that depend on experience, interpretation, or reviewer judgment rather than explicit operating rules."
      )
    ].filter(Boolean);

    return {
      answers: {
        aiCurrentUse: values.aiCurrentUse.trim(),
        aiSensitiveDataExposure: values.aiSensitiveDataExposure,
        aiValidationExpectations: values.aiValidationExpectations,
        aiAccountabilityClarity: values.aiAccountabilityClarity,
        aiGovernanceOwnership: values.aiGovernanceOwnership.trim(),
        aiAutomationTargets: values.aiAutomationTargets.trim(),
        aiAmplificationVisibleProblem: values.aiAmplificationVisibleProblem.trim(),
        aiHumanJudgmentStabilizers: values.aiHumanJudgmentStabilizers.trim(),
        aiTrustWithoutVerificationRisk: values.aiTrustWithoutVerificationRisk.trim(),
        aiLeadershipAutomationBeliefs: values.aiLeadershipAutomationBeliefs.trim(),
        aiDecisionJudgment: values.aiDecisionJudgment.trim(),
        aiRecoverability: values.aiRecoverability
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
          focus: "Approved and shadow tool usage, governance ownership, approval boundaries, and accountability.",
          signals: {
            currentUseAndToolApproval: values.aiCurrentUse.trim(),
            governanceOwnership: values.aiGovernanceOwnership.trim(),
            accountabilityClarity: values.aiAccountabilityClarity
          }
        },
        operationalAiReadiness: {
          focus: "Automation target stability, core workaround dependence, recoverability, and validation expectations.",
          signals: {
            automationTargetsAndWorkflowStability: values.aiAutomationTargets.trim(),
            coreWorkarounds: values.workarounds,
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
          focus: "Experience-based decisions, interpretation variance, and policy-reality gaps.",
          signals: {
            decisionJudgment: values.aiDecisionJudgment.trim(),
            policyRealityGap:
              "Compare formal AI governance claims against workaround dependence, hidden usage, decision variance, and validation ambiguity."
          }
        }
      },
      automationGuardrails: [
        "Do not recommend broad AI automation if workflows are unclear.",
        "Do not recommend broad AI automation if workaround dependence is high.",
        "Do not recommend broad AI automation if key decisions depend on experience, interpretation, or judgment rather than explicit rules.",
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
        "When the submitted assessment includes diagnosticPath = ai_readiness or includes aiReadiness fields, analyze AI readiness through the CLEARPATH lens. Do not treat AI readiness as simple technology maturity. Treat it as operational coherence under accelerating complexity. Evaluate whether AI will amplify workflow instability, hidden work, shadow systems, governance ambiguity, escalation inflation, human validation burden, decision accountability gaps, recoverability limits, and trust instability. Do not recommend broad AI automation if workflows are unstable, key decisions depend on experience or interpretation rather than explicit rules, accountability is unclear, sensitive data exposure is high, or validation expectations are undefined. Always preserve CLEARPATH sequencing: Stabilize -> Expose -> Diagnose -> Redesign -> Institutionalize. The AI readiness output should sound like CLEARPATH structural diagnostic intelligence, not generic AI consulting advice."
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
          values.diagnosticPath === "ai_readiness"
            ? h(
                "div",
                { className: "activation-banner" },
                h("strong", null, "AI Readiness activated"),
                h(
                  "span",
                  null,
                  `+${(steps.find((step) => step.id === "aiReadiness") || { fields: [] }).fields.length} targeted validation & governance questions added.`
                )
              )
            : null,
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
        h("p", { className: "label" }, "Operational Blueprint Intake"),
        h("h1", null, "CLEARPATH"),
        h(
          "p",
          { className: "intro" },
          "A structured diagnostic intake that replaces a long discovery call by exposing workflow instability, hidden coordination burden, and policy-reality gaps."
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
    const [collapsed, setCollapsed] = useState({
      core: false,
      ai: false,
      finish: false
    });
    const groups = [
      {
        id: "core",
        title: "Core Blueprint Intake",
        steps: currentSteps.filter((step) => !["aiReadiness", "review"].includes(step.id))
      },
      {
        id: "ai",
        title: "AI Readiness Add-On",
        steps: currentSteps.filter((step) => step.id === "aiReadiness")
      },
      {
        id: "finish",
        title: "Finalize",
        steps: currentSteps.filter((step) => step.id === "review")
      }
    ].filter((group) => group.steps.length);

    function groupProgress(group) {
      const fields = group.steps.flatMap((step) => step.fields);
      const answered = fields.filter((field) => String(values[field.id] || "").trim()).length;
      return {
        answered,
        total: fields.length,
        label: fields.length ? `${answered}/${fields.length} complete` : "Ready when you are"
      };
    }

    return h(
      "aside",
      { className: "step-rail", "aria-label": "Assessment sections" },
      groups.map((group) => {
        const progress = groupProgress(group);
        const isCollapsed = collapsed[group.id];

        return h(
          "section",
          { className: "step-group", key: group.id },
          h(
            "button",
            {
              className: "step-group-toggle",
              onClick: () =>
                setCollapsed((current) => ({
                  ...current,
                  [group.id]: !current[group.id]
                }))
            },
            h("span", { className: "caret" }, isCollapsed ? ">" : "v"),
            h("strong", null, group.title),
            h("small", null, progress.label)
          ),
          isCollapsed
            ? null
            : group.steps.map((step) => {
                const index = currentSteps.findIndex((currentStep) => currentStep.id === step.id);
                const answered = step.fields.filter((field) =>
                  String(values[field.id] || "").trim()
                ).length;
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
