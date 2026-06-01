export const errors = {
  unauthorized: { title: 'Não autorizado', detail: 'Não autorizado' },
  badRequest: {
    title: 'Requisição inválida',
    detail: 'Dados da requisição inválidos.',
  },
  notFound: { title: 'Não encontrado', detail: 'Recurso não encontrado.' },
  forbidden: { title: 'Proibido', detail: 'Ação proibida.' },
  unprocessableEntity: {
    title: 'Erro ao processar',
    detail: 'Erro ao processar a requisição.',
  },
  conflict: { title: 'Conflito', detail: 'Conflito na requisição.' },
  internalServer: {
    title: 'Erro interno do servidor',
    detail: 'Estamos com problemas, tente novamente mais tarde.',
  },
  failedDependency: {
    title: 'Falha na dependência',
    detail: 'Falha na dependência da requisição.',
  },
};
