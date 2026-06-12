//Leonardo Stuani Godoi
export const useValidationRules = () => ({
  nome: {
    required: "Nome e obrigatorio.",
    maxLength: { value: 100, message: "Nome deve ter no maximo 100 caracteres." },
  },
  cpf: {
    required: "CPF e obrigatorio.",
    validate: (value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length === 11 || "CPF deve ter 11 digitos.";
    },
  },
  telefone: {
    validate: (value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      return [10, 11].includes(digits.length) || "Telefone invalido.";
    },
  },
  telefoneObrigatorio: {
    required: "Telefone e obrigatorio.",
    validate: (value) => {
      const digits = value.replace(/\D/g, "");
      return [10, 11].includes(digits.length) || "Telefone invalido.";
    },
  },
  email: {
    required: "E-mail e obrigatorio.",
    maxLength: { value: 100, message: "E-mail deve ter no maximo 100 caracteres." },
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "E-mail invalido.",
    },
  },
  emailOpcional: {
    maxLength: { value: 100, message: "E-mail deve ter no maximo 100 caracteres." },
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "E-mail invalido.",
    },
  },
  login: {
    required: "Login e obrigatorio.",
    maxLength: { value: 11, message: "Login deve ter no maximo 11 caracteres." },
  },
  senha: {
    required: "Senha e obrigatoria.",
    minLength: { value: 6, message: "Senha deve ter pelo menos 6 caracteres." },
  },
  grupo: {
    required: "Grupo ou cargo e obrigatorio.",
  },
  descricao: {
    required: "Descricao e obrigatoria.",
    maxLength: {
      value: 200,
      message: "Descricao deve ter no maximo 200 caracteres.",
    },
  },
  descricaoOpcional: {
    maxLength: {
      value: 200,
      message: "Descricao deve ter no maximo 200 caracteres.",
    },
  },
  valor_unitario: {
    required: "Valor unitario e obrigatorio.",
    min: { value: 0.01, message: "Valor deve ser maior que zero." },
  },
  cep: {
    validate: (value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      return digits.length === 8 || "CEP deve ter 8 digitos.";
    },
  },
  endereco: {
    maxLength: { value: 150, message: "Endereco deve ter no maximo 150 caracteres." },
  },
  bairro: {
    maxLength: { value: 50, message: "Bairro deve ter no maximo 50 caracteres." },
  },
  cidade: {
    maxLength: { value: 50, message: "Cidade deve ter no maximo 50 caracteres." },
  },
  observacao: {
    maxLength: {
      value: 200,
      message: "Observacao deve ter no maximo 200 caracteres.",
    },
  },
  matricula: {
    required: "Matricula e obrigatoria.",
  },
});

export default useValidationRules;