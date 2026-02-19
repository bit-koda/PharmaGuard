def generate_recommendation(risk):
    mapping = {
        "Safe": {"action": "Standard dosing"},
        "Adjust Dosage": {"action": "Reduce or monitor dose"},
        "Toxic": {"action": "Avoid drug or alternative"},
        "Ineffective": {"action": "Consider alternative therapy"}
    }
    return mapping.get(risk, {"action": "Consult specialist"})
