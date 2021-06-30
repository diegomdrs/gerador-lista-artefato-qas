const path = require('path')

const Tarefa = require('../models/tarefa-por-tarefa')
const Artefato = require('../models/artefato-por-tarefa')
const ArtefatoSaida = require('../models/artefato-saida')
const SaidaVO = require('../models/saida-vo')
const Gerador = require('./gerador')

const TIPO_ARTEFATO = require('./constants').TIPO_ARTEFATO

const geradorUtil = require('../util/gerador-util')

module.exports = class GeradorPorTarefa extends Gerador {

  constructor(params) {
    super(params)
  }

  async gerarListaArtefato() {

    try {

      await this.init()

      const listaArtefatoAgrupadoPorTarefa = this.agruparArtefatoPorTarefa(this.listaArquivo)
      const listaSaida = this.obterListaSaidaTarefa(listaArtefatoAgrupadoPorTarefa)

      return listaSaida

    } catch (error) {
      throw new Error(error.message)
    }
  }

  obterListaSaidaTarefa(listaArtefatoAgrupadoPorTarefa) {

    return listaArtefatoAgrupadoPorTarefa.map(tarefa => {

      const saida = new SaidaVO()
      saida.listaNumeroTarefaSaida = [
        {
          numeroTarefa: tarefa.numeroTarefa,
          descricaoTarefa: tarefa.descricaoTarefa,
          hash: tarefa.hash
        }
      ]
      const listaArtefatoSaida = []

      //  Filtra os projetos que estão na lista de artefatos que contem a tarefa do loop
      const listaProjeto = tarefa.listaArtefato.reduce((listaRetorno, artefato) => {
        listaRetorno.add(artefato.nomeProjeto)
        return listaRetorno
      }, new Set())

      for (const nomeProjeto of listaProjeto) {

        // Filtra as extensões que estão na lista de artefatos que contem a tarefa do loop
        const listaArtefatoPorProjeto = tarefa.listaArtefato.filter(
          artefato => artefato.nomeProjeto === nomeProjeto)

        // Filtra as extensões que estão na lista de artefatos que contem a tarefa do loop
        const listaTipoArtefato = listaArtefatoPorProjeto.reduce((listaRetorno, artefato) => {
          listaRetorno.add(artefato.tipoArtefato.tipo)
          return listaRetorno
        }, new Set())

        // Filtra as extensões que estão na lista de artefatos que contem a tarefa do loop
        const listaTipoAlteracao = listaArtefatoPorProjeto.reduce((listaRetorno, artefato) => {
          listaRetorno.add(artefato.tipoAlteracao)
          return listaRetorno
        }, new Set())

        for (const tipoAlteracao of listaTipoAlteracao) {

          for (const tipo of listaTipoArtefato) {

            const listaSaida = this.obterListaSaida(tipo, tipoAlteracao, listaArtefatoPorProjeto)

            listaArtefatoSaida.push.apply(listaArtefatoSaida, listaSaida)
          }
        }

        // Tira os duplicados
        saida.listaArtefatoSaida = listaArtefatoSaida.reduce((lista, artefato) => {

          const contemArtefato = lista.some(item => {
            return item.nomeAntigoArtefato === artefato.nomeAntigoArtefato &&
              item.nomeArtefato === artefato.nomeArtefato &&
              item.nomeNovoArtefato === artefato.nomeNovoArtefato &&
              item.numeroAlteracao === artefato.numeroAlteracao &&
              item.tipoAlteracao === artefato.tipoAlteracao
          })

          if(!contemArtefato)
            lista.push(artefato)

          return lista
        }, [])
      }

      return saida
    })
  }

  obterListaSaida(tipo, tipoAlteracao, listaArtefatoPorProjeto) {

    const listaRetorno = []

    if (tipo !== TIPO_ARTEFATO.OUTROS) {

      const listaAgrupamento = listaArtefatoPorProjeto.filter((artefato) =>
        artefato.tipoAlteracao === tipoAlteracao &&
        artefato.tipoArtefato.tipo === tipo &&
        artefato.tipoArtefato.tipo !== TIPO_ARTEFATO.OUTROS
      )

      listaRetorno.push.apply(listaRetorno, this.obterSaida(listaAgrupamento))

    } else {

      // Filtra as extensões que estão na lista de artefatos
      const listaExtensao = listaArtefatoPorProjeto.reduce((listaRetorno, artefato) => {
        listaRetorno.add(artefato.tipoArtefato.extensao)
        return listaRetorno
      }, new Set())

      for (const extensao of listaExtensao) {

        const listaArtefatoPorExtensao = listaArtefatoPorProjeto
          .filter((artefato) => artefato.tipoArtefato.extensao === extensao &&
            artefato.tipoAlteracao === tipoAlteracao &&
            artefato.tipoArtefato.tipo === TIPO_ARTEFATO.OUTROS)

        listaRetorno.push.apply(listaRetorno, this.obterSaida(listaArtefatoPorExtensao))
      }
    }

    return listaRetorno
  }

  obterSaida(listaAgrupamento) {

    return listaAgrupamento.reduce((listaRetorno, artefato) => {

      const artf = new ArtefatoSaida({
        nomeArtefato: artefato.nomeArtefato,
        tipoAlteracao: artefato.tipoAlteracao,
        numeroAlteracao: artefato.numeroAlteracao,
        hash: artefato.hash
      })

      if (artefato.isTipoAlteracaoRenomear()) {
        artf.nomeNovoArtefato = artefato.nomeNovoArtefato
        artf.nomeAntigoArtefato = artefato.nomeAntigoArtefato
      }

      listaRetorno.push(artf)

      return listaRetorno
    }, [])
  }

  agruparArtefatoPorTarefa(listaArquivo) {

    return listaArquivo.reduce((listaTarefaRetorno, arquivoReduce) => {

      if (this.isArtefatoSeraAdicionado(arquivoReduce)) {

        const novoArtefato = new Artefato({
          nomeArtefato: arquivoReduce.nomeArquivo,
          nomeNovoArtefato: arquivoReduce.commit.nomeNovoArquivo,
          nomeAntigoArtefato: arquivoReduce.commit.nomeAntigoArquivo,
          tipoAlteracao: arquivoReduce.commit.tipoAlteracao,
          tipoArtefato: this.obterTipoArtefato(arquivoReduce.nomeArquivo),
          nomeProjeto: arquivoReduce.nomeProjeto,
          numeroAlteracao: 1,
          hash: arquivoReduce.commit.hash
        })

        const tarefaEncontrada = listaTarefaRetorno.find(tarefa =>
          tarefa.numeroTarefa === arquivoReduce.commit.numeroTarefa)

        if (!tarefaEncontrada) {

          const novaTarefa = new Tarefa({
            numeroTarefa: arquivoReduce.commit.numeroTarefa,
            descricaoTarefa: arquivoReduce.commit.descricaoTarefa,
            listaArtefato: [novoArtefato]
          })

          listaTarefaRetorno.push(novaTarefa)

        } else {

          let artefatoModificadoEncontrado = tarefaEncontrada.listaArtefato.find(artefato =>
            artefato.nomeArtefato === novoArtefato.nomeArtefato && artefato.isTipoAlteracaoModificacao()
          )

          if (artefatoModificadoEncontrado)
            artefatoModificadoEncontrado.numeroAlteracao += 1
          else
            tarefaEncontrada.listaArtefato.push(novoArtefato)
        }
      }

      return listaTarefaRetorno

    }, []).sort(this.ordenarListaTarefa)
  }

  ordenarListaTarefa(tarefaA, tarefaB) {
    return tarefaA.numeroTarefa.localeCompare(tarefaB.numeroTarefa)
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
}