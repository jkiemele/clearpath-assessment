(function () {
  const { useEffect, useMemo, useState } = React;
  const h = React.createElement;

  const STORAGE_KEY = "clearpath-operational-reality-assessment-v1";
  const RESPONDENT_KEY = "clearpath-respondent-v1";
  const ENDPOINT_KEY = "clearpath-sheets-endpoint-v1";
  const configuredEndpoint =
    (window.CLEARPATH_CONFIG && window.CLEARPATH_CONFIG.sheetsEndpoint) || "";

  const steps = [
    {
      id: "context",
      title: "System Context",
      kicker: "Define the operating arena.",
      fields: [
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
    values[field.id] = "";
    return values;
  }, {});

  function completionFor(values) {
    const answered = allFields.filter((field) => values[field.id].trim()).length;
    return {
      answered,
      total: allFields.length,
      percent: Math.round((answered / allFields.length) * 100)
    };
  }

  function createExportPayload(values, respondent) {
    return {
      assessment: "CLEARPATH Operational Reality Assessment",
      version: "1.0",
      generatedAt: new Date().toISOString(),
      submittedAt: null,
      respondent: {
        name: respondent.name.trim(),
        organization: respondent.organization.trim(),
        email: respondent.email.trim()
      },
      completion: completionFor(values),
      responses: steps
        .filter((step) => step.fields.length)
        .map((step) => ({
          section: step.title,
          answers: step.fields.map((field) => ({
            id: field.id,
            label: field.label,
            question: field.prompt,
            response: values[field.id].trim()
          }))
        }))
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
      () => createExportPayload(values, respondent),
      [values, respondent]
    );
    const active = steps[activeStep];
    const stepAnswered = active.fields.filter((field) => values[field.id].trim()).length;
    const stepPercent = active.fields.length
      ? Math.round((stepAnswered / active.fields.length) * 100)
      : completion.percent;

    function updateField(id, nextValue) {
      setValues((current) => ({ ...current, [id]: nextValue }));
    }

    function goToStep(index) {
      setActiveStep(Math.max(0, Math.min(steps.length - 1, index)));
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

    function clearDraft() {
      const confirmed = window.confirm("Clear all assessment responses?");
      if (confirmed) {
        setValues(blankValues);
        setRespondent({ name: "", organization: "", email: "" });
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
      h(Header, { completion }),
      h(
        "section",
        { className: "workspace" },
        h(StepRail, { activeStep, completion, goToStep, values }),
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
                clearDraft,
                respondent,
                setRespondent,
                sheetsEndpoint,
                setSheetsEndpoint,
                submitState,
                submitMessage,
                submitToSheets,
                configuredEndpoint
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
                disabled: activeStep === steps.length - 1
              },
              activeStep === steps.length - 2 ? "Review" : "Next"
            )
          )
        )
      )
    );
  }

  function Header({ completion }) {
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
        )
      )
    );
  }

  function StepRail({ activeStep, goToStep, values }) {
    return h(
      "aside",
      { className: "step-rail", "aria-label": "Assessment sections" },
      steps.map((step, index) => {
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
    clearDraft,
    respondent,
    setRespondent,
    sheetsEndpoint,
    setSheetsEndpoint,
    submitState,
    submitMessage,
    submitToSheets,
    configuredEndpoint
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
          "p",
          null,
          "Send the intake to Google Sheets, or copy/download the same structured payload for your custom GPT."
        ),
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
          h("button", { className: "button subtle", onClick: clearDraft }, "Clear draft")
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

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
