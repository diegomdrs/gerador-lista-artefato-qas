const path = require('path')

const Tarefa = require('../models/tarefa-por-tipo-artefato')
const Artefato = require('../models/artefato')
const ArtefatoSaida = require('../models/artefato-saida')
const SaidaVO = require('../models/saida-vo')
const Gerador = require('./gerador')

const geradorUtil = require('../util/gerador-util')

const TIPO_MODIFICACAO = require('./constants').TIPO_MODIFICACAO
const TIPO_ARTEFATO = require('./constants').TIPO_ARTEFATO

module.exports = class GeradorPorTipoArtefato extends Gerador {

  constructor(params) {
    super(params)
  }

  async gerarListaArtefato() {

    await this.init()

    const listaTarefaAgrupadaPorArtefato = this.agruparTarefaPorArtefato(this.listaArquivo)
    const listaArtefatoComTarefaMesmoTipoAlteracao = this.obterListaArtefatoComTarefaMesmoTipoAlteracao(listaTarefaAgrupadaPorArtefato)
    const listaArtefatoSemTarefaMesmoTipoAlteracao = this.obterListaArtefatoSemTarefaMesmoTipoAlteracao(listaTarefaAgrupadaPorArtefato)

    const listaSaidaTarefasUmArtefato =
      this.obterListaSaidaTarefasUmArtefato(listaArtefatoComTarefaMesmoTipoAlteracao)
    const listaSaidaArtefatosUmaTarefa =
      this.obterListaSaidaArtefatosUmaTarefa(listaArtefatoSemTarefaMesmoTipoAlteracao)

    const retorno = listaSaidaTarefasUmArtefato.concat(listaSaidaArtefatosUmaTarefa)

    return retorno
  }

  obterListaSaidaTarefasUmArtefato(listaArtefatoComTarefaMesmoTipoAlteracao) {

    return listaArtefatoComTarefaMesmoTipoAlteracao.reduce((listaRetorno, artefato) => {

      this.obterListaArtefatoSemTarefaRenomear(artefato, listaRetorno)

      if (this.params.mostrarRenomeados) {
        this.obterListaArtefatoComTarefaRenomear(artefato, listaRetorno)
      }

      return listaRetorno
    }, [])
  }

  obterListaArtefatoSemTarefaRenomear(artefato, listaArtefatoSemTarefaRenomear) {

    const listaTarefaNaoRenomear = artefato.listaTarefa.filter(tarefa => {
      return !tarefa.isTipoAlteracaoRenomear()
    })

    if (listaTarefaNaoRenomear.length) {

      let saida = new SaidaVO()
      let totalModificacao = 0
      let tipoAlteracao = ''

      saida.listaNumeroTarefaSaida = listaTarefaNaoRenomear.map((tarefa) => {
        totalModificacao += tarefa.numeroAlteracao
        tipoAlteracao = tarefa.tipoAlteracao
        return {
          numeroTarefa: tarefa.numeroTarefa,
          descricaoTarefa: tarefa.descricaoTarefa,

          // TODO - Descomentar apos testes de lista de artefatos por tarefa com hash
          // hash: tarefa.hash
        }
      })

      const artefatoSaida = new ArtefatoSaida({
        nomeArtefato: artefato.nomeArtefato,
        tipoAlteracao: tipoAlteracao,
        numeroAlteracao: totalModificacao
      })

      saida.listaArtefatoSaida.push(artefatoSaida)
      listaArtefatoSemTarefaRenomear.push(saida)
    }
  }

  obterListaArtefatoComTarefaRenomear(artefato, listaArtefatoComTarefaRenomear) {

    const listaTarefaRenomear = artefato.listaTarefa.filter(tarefa => {
      return tarefa.isTipoAlteracaoRenomear()
    })

    if (listaTarefaRenomear.length) {

      const lista = listaTarefaRenomear.reduce((listaRetorno, tarefa) => {

        const artefatoSaida = new ArtefatoSaida({
          nomeNovoArtefato: tarefa.nomeNovoArquivo,
          nomeAntigoArtefato: tarefa.nomeAntigoArquivo,
          tipoAlteracao: tarefa.tipoAlteracao,
          numeroAlteracao: tarefa.numeroAlteracao
        })

        const saidaEncontrada = listaRetorno.find(saida =>
          saida.listaNumeroTarefaSaida.some(tarefaSome =>
            tarefa.numeroTarefa === tarefaSome.numeroTarefa))

        if (!saidaEncontrada) {

          const saida = new SaidaVO()

          // TODO - Ver esse caso aqui
          saida.listaNumeroTarefaSaida = [
            { 
              numeroTarefa: tarefa.numeroTarefa,
              descricaoTarefa: tarefa.descricaoTarefa,

              // TODO - Descomentar apos testes de lista de artefatos por tarefa com hash
              // hash: tarefa.hash
            }
          ]
          saida.listaArtefatoSaida.push(artefatoSaida)
          listaRetorno.push(saida)

        } else {

          saidaEncontrada.listaArtefatoSaida.push(artefatoSaida)
        }

        return listaRetorno
      }, [])

      listaArtefatoComTarefaRenomear.push.apply(listaArtefatoComTarefaRenomear, lista)
    }
  }

  obterListaSaidaArtefatosUmaTarefa(listaArtefatoSemTarefaMesmoTipo) {

    return this.params.listaTarefa.reduce((accumListaSaida, tarefaParam) => {

      const tarefa = {
        numeroTarefa: tarefaParam
      }

      // Filtra os artefatos que contem a tarefa do loop
      const listaArtefatoTarefa = listaArtefatoSemTarefaMesmoTipo.filter(artefato =>
        artefato.listaTarefa.some(tarefa =>
          tarefa.numeroTarefa === tarefaParam)
      )

      if (listaArtefatoTarefa.length) {
        const tarefaLista = listaArtefatoTarefa[0].listaTarefa.find(tarefa => tarefa.numeroTarefa === tarefaParam)
        tarefa.descricaoTarefa = tarefaLista.descricaoTarefa

        // TODO - Descomentar apos testes de lista de artefatos por tarefa com hash
        // tarefa.hash = tarefaLista.hash
      }

      // Filtra os projetos que estão na lista de artefatos que contem a tarefa do loop
      const listaProjeto = listaArtefatoTarefa.reduce((listaRetorno, artefato) => {
        listaRetorno.add(artefato.nomeProjeto)
        return listaRetorno
      }, new Set())

      // Filtra as extensões que estão na lista de artefatos que contem a tarefa do loop
      const listaTipoArtefato = listaArtefatoTarefa.reduce((listaRetorno, artefato) => {
        listaRetorno.add(artefato.tipoArtefato.tipo)
        return listaRetorno
      }, new Set())

      for (const nomeProjeto of listaProjeto) {

        const listaArtefatoPorProjeto = listaArtefatoTarefa
          .filter((artefatoFilterProjeto) =>
            artefatoFilterProjeto.nomeProjeto === nomeProjeto
          )

        for (const tipoAlteracao of Object.values(TIPO_MODIFICACAO)) {

          for (const tipo of listaTipoArtefato) {

            const listaSaida = this.obterListaSaida(tipo, tarefa,
              tipoAlteracao, listaArtefatoPorProjeto)

            accumListaSaida.push.apply(accumListaSaida, listaSaida)
          }
        }
      }

      return accumListaSaida

    }, []).sort(this.ordenarListaSaidaPorQuantidadeArtefato)
  }

  obterListaSaida(tipo, tarefaParam, tipoAlteracao, listaArtefatoPorProjeto) {

    const listaRetorno = []

    if (tipo !== TIPO_ARTEFATO.OUTROS) {

      const listaAgrupamento = listaArtefatoPorProjeto.filter((artefato) =>
        artefato.tipoArtefato.tipo === tipo &&
        artefato.tipoArtefato.tipo !== TIPO_ARTEFATO.OUTROS
      )

      listaRetorno.push(this.obterSaida(tarefaParam, tipoAlteracao, listaAgrupamento))

    } else {

      // Filtra as extensões que estão na lista de artefatos
      const listaExtensao = listaArtefatoPorProjeto.reduce((listaRetorno, artefato) => {
        listaRetorno.add(artefato.tipoArtefato.extensao)
        return listaRetorno
      }, new Set())

      for (const extensao of listaExtensao) {

        const listaArtefatoPorExtensao = listaArtefatoPorProjeto
          .filter((artefato) => artefato.tipoArtefato.extensao === extensao &&
            artefato.tipoArtefato.tipo === TIPO_ARTEFATO.OUTROS)

        listaRetorno.push(this.obterSaida(
          tarefaParam, tipoAlteracao, listaArtefatoPorExtensao))
      }
    }

    return listaRetorno.filter(saida => saida.listaArtefatoSaida.length)
  }

  obterSaida(tarefaParam, tipoAlteracao, listaAgrupamento) {

    const saida = new SaidaVO()

    saida.listaNumeroTarefaSaida.push(tarefaParam)
    saida.listaArtefatoSaida = listaAgrupamento.reduce((listaRetorno, artefato) => {

      const listaTarefa = artefato.listaTarefa.filter(tarefa =>
        tarefa.numeroTarefa === tarefaParam.numeroTarefa &&
        tarefa.tipoAlteracao === tipoAlteracao)

      for (const tarefa of listaTarefa) {

        const artf = new ArtefatoSaida({
          nomeArtefato: artefato.nomeArtefato,
          tipoArtefato: artefato.tipoArtefato,
          tipoAlteracao: tarefa.tipoAlteracao,
          numeroAlteracao: tarefa.numeroAlteracao,
          nomeAntigoArtefato: tarefa.nomeAntigoArquivo,
          nomeNovoArtefato: tarefa.nomeNovoArquivo
        })

        listaRetorno.push(artf)
      }

      return listaRetorno
    }, [])

    return saida
  }

  obterTipoArtefato(nomeArtefato) {

    const filename = path.basename(nomeArtefato)
    const extensao = geradorUtil.obterExtensaoArquivo(nomeArtefato)

    const tipo = Object.values(TIPO_ARTEFATO).find((listaRegex) =>
      listaRegex.some((item) => filename.match(item.regex))
    )

    return {
      extensao: extensao,
      tipo: tipo
    }
  }

  /*
  Obtem lista artefatos com tarefas com o mesmo tipo de modificação. 
   
  ex. 
  ---
  Tarefas nº 1189666, 1176490
   
  M	2 foo-estatico/src/lista-foo.tpl.html
  ---
   
  No exemplo, o artefato lista-foo.tpl.html possui 2 tarefas diferentes (1189666 e 1176490)
  com o mesmo tipo de modificação ('M' - Modified)
  */
  obterListaArtefatoComTarefaMesmoTipoAlteracao(listaArtefato) {

    let listaArtefatoTarefaMesmoTipo = []

    for (const artefato of listaArtefato) {

      if (artefato.listaTarefa.length > 1) {

        // TODO - refatorar
        const listaTarefasMesmoTipo = artefato.listaTarefa
          .filter((tarefaAtual, indexAtual) => {

            const listaSemTarefaAtual = artefato.listaTarefa
              .filter((tarefaFilter, index) => index !== indexAtual)

            // Existe alguma outra tarefa com o mesmo tipo da atual?
            const retorno = listaSemTarefaAtual.some(tarefaSome =>
              tarefaAtual.tipoAlteracao === tarefaSome.tipoAlteracao
            )

            return retorno
          })

        if (listaTarefasMesmoTipo.length) {

          listaArtefatoTarefaMesmoTipo.push(
            new Artefato({
              nomeArtefato: artefato.nomeArtefato,
              listaTarefa: listaTarefasMesmoTipo
            }))
        }
      }
    }

    return listaArtefatoTarefaMesmoTipo
  }

  /*
  Obtem lista de artefatos sem tarefas com o mesmo tipo de modificação. 
   
  ex. 
  ---
  Tarefas nº 1189777
   
  M	1 foo-estatico/src/lista-bar.tpl.html
  A	1 foo-estatico/src/lista-bar.tpl.html
  ---
   
  No exemplo, o artefato lista-bar.tpl.html possui tarefas únicas 
  em relação ao tipo de modificação. 'A' (Added) logicamente só aparece uma vez e
  'M' só aparece se o arquivo tiver sido modificado uma vez
  
  Artefatos com tarefas com números iguais
  
  */
  obterListaArtefatoSemTarefaMesmoTipoAlteracao(listaArtefato) {

    let listaArtefatoUmTipoModificacao = []

    for (const artefato of listaArtefato) {

      if (artefato.listaTarefa.length === 1) {

        listaArtefatoUmTipoModificacao.push(artefato)

      } else if (artefato.listaTarefa.length > 1) {

        // TODO - refatorar
        const listaTarefaUnicoTipoAlteracao = artefato.listaTarefa
          .filter((tarefaAtual, indexAtual) => {

            const listaSemTarefaAtual = artefato.listaTarefa
              .filter((tarefaFilter, index) => index !== indexAtual)

            // Existe alguma outra tarefa com o mesmo tipo da atual?
            const retorno = listaSemTarefaAtual.some(
              tarefaSome => tarefaAtual.tipoAlteracao === tarefaSome.tipoAlteracao)

            return !retorno
          })

        if (listaTarefaUnicoTipoAlteracao.length) {

          listaArtefatoUmTipoModificacao.push(
            new Artefato({
              nomeArtefato: artefato.nomeArtefato,
              tipoArtefato: artefato.tipoArtefato,
              nomeProjeto: artefato.nomeProjeto,
              listaTarefa: listaTarefaUnicoTipoAlteracao
            }))
        }
      }
    }

    return listaArtefatoUmTipoModificacao
  }

  agruparTarefaPorArtefato(listaArquivo) {

    return listaArquivo.reduce((accum, arquivoReduce) => {

      if (this.isArtefatoSeraAdicionado(arquivoReduce)) {

        const novaTarefa = new Tarefa({
          numeroTarefa: arquivoReduce.commit.numeroTarefa,
          descricaoTarefa: arquivoReduce.commit.descricaoTarefa,

          // TODO - Descomentar apos testes de lista de artefatos por tarefa com hash
          // hash: arquivoReduce.commit.hash,

          tipoAlteracao: arquivoReduce.commit.tipoAlteracao,
          nomeAntigoArquivo: arquivoReduce.commit.nomeAntigoArquivo,
          nomeNovoArquivo: arquivoReduce.commit.nomeNovoArquivo
        })

        const novoArtefato = new Artefato({
          nomeArtefato: arquivoReduce.nomeArquivo,
          tipoArtefato: this.obterTipoArtefato(arquivoReduce.nomeArquivo),
          nomeProjeto: arquivoReduce.nomeProjeto,
          listaTarefa: [novaTarefa]
        })

        if (accum.length === 0) {

          accum = [novoArtefato]

        } else if (accum.length > 0) {

          let artefatoEncontrado = accum.find(artefato =>
            artefato.nomeArtefato === arquivoReduce.nomeArquivo)

          if (artefatoEncontrado) {

            // Somente será incrementado o número de alterações se for MODIFIED
            let tarefaEncontrada = artefatoEncontrado.listaTarefa.find(tarefa =>
              tarefa.numeroTarefa === arquivoReduce.commit.numeroTarefa &&
              tarefa.tipoAlteracao === TIPO_MODIFICACAO.MODIFIED
            )

            if (tarefaEncontrada)
              tarefaEncontrada.numeroAlteracao += 1
            else
              artefatoEncontrado.listaTarefa.push(novaTarefa)

          } else {
            accum.push(novoArtefato)
          }
        }
      }

      return accum

    }, []).sort(this.ordenarListaArtefato)
  }

  ordenarListaArtefato(artefatoA, artefatoB) {
    return artefatoA.nomeProjeto.localeCompare(artefatoB.nomeProjeto) ||
      artefatoA.obterNomeArtefatoReverso().localeCompare(artefatoB.obterNomeArtefatoReverso())
  }

  ordenarListaSaidaPorQuantidadeArtefato(saidaA, saidaB) {
    return saidaA.listaArtefatoSaida.length - saidaB.listaArtefatoSaida.length
  }
}