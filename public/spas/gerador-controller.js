angular
    .module('geradorApp')
    .controller('GeradorController', GeradorController)

GeradorController.$inject = ['FileSaver', 'Blob', 'geradorService', 'blockUI', 'clipboardUtil', 'geradorConstants', 'deviceDetector'];

function GeradorController(FileSaver, Blob, geradorService, blockUI, clipboardUtil, geradorConstants, deviceDetector) {
    var vm = this

    vm.listaSaida = []
    vm.req = {}

    vm.TIPO_ALERTA = geradorConstants.TIPO_ALERTA
    vm.TIPO_MODIFICACAO = geradorConstants.TIPO_MODIFICACAO
    vm.TIPO_LISTAGEM = geradorConstants.TIPO_LISTAGEM

    vm.init = init
    vm.listarArtefatos = listarArtefatos
    vm.limparFiltros = limparFiltros

    vm.obterNumero = obterNumero
    vm.obterDescricaoModificacao = obterDescricaoModificacao

    vm.adicionarCaminhoProjeto = adicionarCaminhoProjeto
    vm.removerCaminhoProjeto = removerCaminhoProjeto
    vm.adicionarTask = adicionarTask
    vm.removerTask = removerTask
    vm.obterNomeProjeto = obterNomeProjeto
    vm.obterNomeArtefato = obterNomeArtefato
    vm.copiarLinhaClipboardPorTarefa = copiarLinhaClipboardPorTarefa
    vm.copiarLinhaClipboardPorTipoArtefato = copiarLinhaClipboardPorTipoArtefato
    vm.exportarArquivoCsv = exportarArquivoCsv
    vm.exportarArquivoTxt = exportarArquivoTxt
    vm.close = close

    async function init() {

        limparMessages()
        limparFiltros()

        const caminhoPadraoProjeto = geradorConstants.TIPO_DIRETORIO_PADRAO[deviceDetector.os]
        vm.msgSugestaoListaCaminhoProjeto = `Adicione um ou mais caminhos ex. ${
            caminhoPadraoProjeto}, ${caminhoPadraoProjeto}/foo-api`
    }

    function listarDiretorio(listaDiretorio) {

        blockUI.start()

        return geradorService.listarDiretorio(listaDiretorio)
            .catch((error) => {

                adicionarMensagemErro(error.data.message,
                    geradorConstants.TIPO_POSICAO_ALERT.DEFAULT)

                vm.listaCaminhoProjeto = []

            }).finally(() => blockUI.stop())
    }

    function listarArtefatos() {

        limparMessages()

        if (vm.req.listaTarefa.length && vm.req.listaProjeto.length) {

            vm.req.tipoListagem = vm.tipoListagem

            blockUI.start()

            geradorService.gerarListaArtefato(vm.req)
                .then((resposta) => {

                    vm.listaSaida = resposta.data

                    !vm.listaSaida.length && adicionarMensagemErro
                        ('Nenhum resultado encontrado', geradorConstants.TIPO_POSICAO_ALERT.DEFAULT)

                }).catch((error) => {

                    adicionarMensagemErro(error.data.message,
                        geradorConstants.TIPO_POSICAO_ALERT.DEFAULT)

                    vm.listaSaida = []

                }).finally(() => blockUI.stop())

        } else {

            !vm.req.listaTarefa.length && adicionarMensagemErro
                ('Adicione ao menos uma tarefa ao filtro', geradorConstants.TIPO_POSICAO_ALERT.DEFAULT)

            !vm.req.listaProjeto.length && adicionarMensagemErro
                ('Adicione ao menos um projeto ao filtro', geradorConstants.TIPO_POSICAO_ALERT.DEFAULT)
        }
    }

    function obterNumero(saida) {

        if (saida.listaArtefatoSaida.length === 1)
            return saida.listaNumeroTarefaSaida.length
        else
            return saida.listaArtefatoSaida.length
    }

    function obterDescricaoModificacao(codigoModificacao) {

        return Object.values(vm.TIPO_MODIFICACAO).find(
            tipoModificacao => tipoModificacao.codigo === codigoModificacao).descricao
    }

    function removerTask(taskRemocao) {

        limparMessages()

        vm.req.listaTarefa = vm.req.listaTarefa.filter(tarefa =>
            tarefa !== taskRemocao)
    }

    function adicionarTask() {

        limparMessages()

        if (vm.listaTarefa) {

            const listaTarefa = vm.listaTarefa.split(',').filter(tarefa => tarefa);

            for (const tarefa of listaTarefa) {

                const contemTarefa = vm.req.listaTarefa.some((tarefaSome) =>
                    tarefa === tarefaSome)

                if (!contemTarefa)
                    vm.req.listaTarefa.push(tarefa)
                else
                    adicionarMensagemErro(`${tarefa} já consta na lista de tarefas`,
                        geradorConstants.TIPO_POSICAO_ALERT.DEFAULT)
            }

            delete vm.listaTarefa
        }
    }

    async function adicionarCaminhoProjeto() {

        limparMessages()

        if (vm.listaCaminhoProjeto) {

            const listaProjeto = vm.listaCaminhoProjeto.split(',').filter(caminho => caminho)
            const listaPesquisa = []

            for (const projeto of listaProjeto) {

                const contemProjeto = vm.req.listaProjeto.some((projetoSome) =>
                    projeto.trim() === projetoSome)

                if (!contemProjeto)
                    listaPesquisa.push(projeto.trim())
                else
                    adicionarMensagemErro(`${projeto.trim()} já consta na lista de projetos`,
                        geradorConstants.TIPO_POSICAO_ALERT.DEFAULT)
            }

            if (listaPesquisa.length) {

                listarDiretorio(listaPesquisa).then(({ data }) => {

                    if (data.length) {
                        for (const diretorio of data)
                            if (!vm.req.listaProjeto.some(proj => proj === diretorio))
                                vm.req.listaProjeto.push(diretorio)
                    }
                    else
                        adicionarMensagemErro('Nenhum diretório encontrado',
                            geradorConstants.TIPO_POSICAO_ALERT.DEFAULT)
                })

                delete vm.listaCaminhoProjeto
            }
        }
    }

    function removerCaminhoProjeto(caminhoRemocao) {

        limparMessages()

        vm.req.listaProjeto = vm.req.listaProjeto.filter(caminho =>
            caminho !== caminhoRemocao)
    }

    function limparMessages() {

        vm.alerts = []
    }

    function adicionarMensagemSucesso(mensagem, tipo) {
        adicionarMensagem(vm.TIPO_ALERTA.SUCCESS, mensagem, tipo)
    }

    function adicionarMensagemErro(mensagem, tipo) {
        adicionarMensagem(vm.TIPO_ALERTA.ERROR, mensagem, tipo)
    }

    function adicionarMensagem(tipoAlerta, mensagem, tipo) {

        const message = {
            tipoAlerta: tipoAlerta,
            text: mensagem,
            tipo: tipo,
        }

        vm.alerts.push(message)
    }

    function limparFiltros() {

        limparMessages()

        vm.tipoListagem = vm.TIPO_LISTAGEM.POR_TAREFA.codigo

        vm.req = {
            listaProjeto: [],
            listaTarefa: [],
            mostrarDeletados: false,
            mostrarRenomeados: false
        }

        delete vm.listaSaida
        delete vm.listaCaminhoProjeto
        delete vm.listaTarefa
    }

    function obterNomeProjeto(caminhoProjeto) {

        return caminhoProjeto.match(/([^/|\\]*)$/g)[0]
    }

    function obterNomeArtefato(artefato) {

        return (artefato.tipoAlteracao === 'R')
            ? artefato.nomeAntigoArtefato + ' ' + artefato.nomeNovoArtefato
            : artefato.nomeArtefato
    }

    function exportarArquivoCsv() {

        limparMessages()

        blockUI.start()

        geradorService.obterListaArtefatoCsv(vm.req)
            .then((resposta) => {

                if (resposta.data) {

                    var data = new Blob([resposta.data], { type: 'text/csv;charset=utf-8' })
                    FileSaver.saveAs(data, 'lista-artefato.csv')

                } else
                    adicionarMensagemErro
                        ('Nenhum resultado encontrado', geradorConstants.TIPO_POSICAO_ALERT.DEFAULT)

            }).catch((error) => {

                adicionarMensagemErro(error.data.message,
                    geradorConstants.TIPO_POSICAO_ALERT.DEFAULT)

            }).finally(() => blockUI.stop())
    }

    function exportarArquivoTxt() {

        limparMessages()

        const textoSaida = vm.req.tipoListagem === vm.TIPO_LISTAGEM.POR_TAREFA.codigo ?
            obterTextoListaSaidaPorTarefa(vm.listaSaida) : obterTextoListaSaidaPorTipoArtefato(vm.listaSaida)

        var data = new Blob([textoSaida], { type: 'text/txt;charset=utf-8' })
        FileSaver.saveAs(data, 'lista-artefato.txt')
    }

    function copiarLinhaClipboardPorTarefa(listaArtefato) {

        limparMessages()

        const textoSaida = obterTextoListaArtefatoPorTarefa(listaArtefato)

        clipboardUtil.copiarTabelaClipboard(textoSaida)

        adicionarMensagemSucesso('Dados da linha copiados para o clipboard',
            geradorConstants.TIPO_POSICAO_ALERT.TOP)
    }

    function copiarLinhaClipboardPorTipoArtefato(saida) {

        limparMessages()

        const textoSaida = obterTextoListaSaidaPorTipoArtefato([saida])

        clipboardUtil.copiarTabelaClipboard(textoSaida)

        adicionarMensagemSucesso('Dados da linha copiados para o clipboard',
            geradorConstants.TIPO_POSICAO_ALERT.TOP)
    }

    function obterTextoListaSaidaPorTarefa(listaSaida) {

        return listaSaida.reduce((saidaTexto, saida) => {

            const tarefa = saida.listaNumeroTarefaSaida[0];

            saidaTexto = saidaTexto.concat(`\nTarefa nº ${tarefa.numeroTarefa} - ${tarefa.descricaoTarefa}\n`)
            saidaTexto = saidaTexto.concat(obterTextoListaArtefatoPorTarefa(saida.listaArtefatoSaida))
            saidaTexto = saidaTexto.concat('\n')

            return saidaTexto
        }, '')
    }

    function obterTextoListaSaidaPorTipoArtefato(listaSaida) {

        return listaSaida.reduce((saidaTexto, saida) => {

            if (saida.listaNumeroTarefaSaida.length === 1) {

                const tarefa = saida.listaNumeroTarefaSaida[0]
                saidaTexto = saidaTexto.concat(`\nTarefa nº ${tarefa.numeroTarefa} - ${tarefa.descricaoTarefa}\n`)
            }
            else if (saida.listaNumeroTarefaSaida.length > 1) {

                const tarefas = saida.listaNumeroTarefaSaida.reduce((saidaFoo, tarefa) => {
                    saidaFoo = saidaFoo.concat(`Tarefa nº ${tarefa.numeroTarefa} - ${tarefa.descricaoTarefa}\n`)
                    return saidaFoo
                }, '')
    
                saidaTexto = saidaTexto.concat(`\n${tarefas}`);
            }

            saidaTexto = saidaTexto.concat(obterTextoListaArtefatoPorTipoArquivo(saida.listaArtefatoSaida))
            saidaTexto = saidaTexto.concat('\n')

            return saidaTexto
        }, '')
    }

    function obterTextoListaArtefatoPorTarefa(listaArtefato) {

        return listaArtefato.reduce((saidaTexto, artefato) => {

            if (artefato.tipoAlteracao !== vm.TIPO_MODIFICACAO.RENAMED.codigo &&
                artefato.tipoAlteracao !== vm.TIPO_MODIFICACAO.DELETED.codigo) {

                saidaTexto = saidaTexto.concat('\n')

                if (artefato.tipoAlteracao === vm.TIPO_MODIFICACAO.ADDED.codigo)
                    saidaTexto = saidaTexto.concat('+')

                saidaTexto = saidaTexto.concat(`${artefato.nomeArtefato}#${artefato.hash}`)
            }

            return saidaTexto
        }, '')
    }

    function obterTextoListaArtefatoPorTipoArquivo(listaArtefato) {

        return listaArtefato.reduce((saidaTexto, artefato) => {

            saidaTexto = saidaTexto.concat(`\n${artefato.tipoAlteracao}\t`)

            if (artefato.tipoAlteracao === geradorConstants.TIPO_MODIFICACAO.RENAMED.codigo)
                saidaTexto = saidaTexto.concat(`${artefato.nomeAntigoArtefato}\t${artefato.nomeNovoArtefato}`)
            else
                saidaTexto = saidaTexto.concat(artefato.nomeArtefato)

            return saidaTexto
        }, '')
    }

    function close($index) {
        vm.alerts.splice($index, 1)
    }
}