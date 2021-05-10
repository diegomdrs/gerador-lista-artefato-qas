angular
    .module('geradorApp')
    .constant('geradorConstants', {

        TIPO_LISTAGEM: {
            POR_TAREFA: { codigo: 'POR_TAREFA', descricao: 'Por Tarefa' },
            POR_TIPO_ARTEFATO: { codigo: 'POR_TIPO_ARTEFATO', descricao: 'Por Tipo de Artefato' }
        },

        TIPO_MODIFICACAO: {
            ADDED: { codigo: 'A', descricao: 'Criado' },
            MODIFIED: { codigo: 'M', descricao: 'Alterado' },
            RENAMED: { codigo: 'R', descricao: 'Renomeado' },
            DELETED: { codigo: 'D', descricao: 'Deletado' }
        },

        TIPO_ALERTA: {
            SUCCESS: { class: 'alert-success', icone: '✓' },
            ERROR: { class: 'alert-danger', icone: '✗' },
        },

        TIPO_POSICAO_ALERT: {
            DEFAULT: { class: 'alert alert-dismissible' },
            TOP: { class: 'alert alert-dismissible container alert-top' },
        },

        TIPO_DIRETORIO_PADRAO: {
            windows: 'C:/kdi/git',
            linux: '/kdi/git',
            mac: '/kdi/git'
        },
    })