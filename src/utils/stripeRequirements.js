const REQUIREMENT_LABELS = {
  "business_profile.mcc": "Categoria do negocio (MCC)",
  "business_profile.product_description": "Descricao dos produtos/servicos",
  business_type: "Tipo de negocio",
  external_account: "Conta bancaria",
  "representative.address.city": "Cidade do representante",
  "representative.address.line1": "Endereco do representante",
  "representative.address.postal_code": "CEP do representante",
  "representative.address.state": "Estado do representante",
  "representative.dob.day": "Dia de nascimento do representante",
  "representative.dob.month": "Mes de nascimento do representante",
  "representative.dob.year": "Ano de nascimento do representante",
  "representative.email": "Email do representante",
  "representative.first_name": "Nome do representante",
  "representative.id_number": "CPF do representante",
  "representative.last_name": "Sobrenome do representante",
  "representative.phone": "Telefone do representante",
  "representative.political_exposure": "Exposicao politica do representante",
  "representative.verification.additional_document": "Documento adicional do representante",
  "representative.verification.document": "Documento do representante",
  "individual.address.city": "Cidade do titular",
  "individual.address.line1": "Endereco do titular",
  "individual.address.postal_code": "CEP do titular",
  "individual.address.state": "Estado do titular",
  "individual.dob.day": "Dia de nascimento do titular",
  "individual.dob.month": "Mes de nascimento do titular",
  "individual.dob.year": "Ano de nascimento do titular",
  "individual.email": "Email do titular",
  "individual.first_name": "Nome do titular",
  "individual.id_number": "CPF do titular",
  "individual.last_name": "Sobrenome do titular",
  "individual.phone": "Telefone do titular",
  "individual.political_exposure": "Exposicao politica do titular",
  "individual.verification.additional_document": "Documento adicional do titular",
  "individual.verification.document": "Documento do titular",
  "tos_acceptance.date": "Aceite dos termos (data)",
  "tos_acceptance.ip": "Aceite dos termos (IP)",
};

const DISABLED_REASON_LABELS = {
  "requirements.past_due": "Dados pendentes no cadastro",
  "requirements.pending_verification": "Em verificacao pelo Stripe",
  "requirements.pending_verification_waiting_on_user": "Aguardando informacoes do usuario",
};

const formatRequirement = (key) => {
  if (REQUIREMENT_LABELS[key]) return REQUIREMENT_LABELS[key];
  return String(key || "")
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .trim();
};

const formatDisabledReason = (reason) => {
  if (!reason) return null;
  if (DISABLED_REASON_LABELS[reason]) return DISABLED_REASON_LABELS[reason];
  return String(reason || "")
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .trim();
};

const formatRequirementsList = (items = []) =>
  (Array.isArray(items) ? items : []).map(formatRequirement).filter(Boolean);

export { formatDisabledReason, formatRequirementsList };
