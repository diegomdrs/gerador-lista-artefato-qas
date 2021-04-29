const { Parser } = require('json2csv');

module.exports = {

    obterSaidaCsv: (listaSaida) => {

        const fields = [
            { label: 'Número de Alterações', value: 'numeroAlteracao' },
            { label: 'Nome dos artefatos', value: 'listaNomeArtefato' },
            { label: 'O que será feito', value: 'numeroTarefa' }
        ]

        const listaSaidaCVS = listaSaida.reduce((listaRetorno, saida) => {

            const obj = {}

            if (saida.listaNumeroTarefaSaida.length === 1)
                obj.numeroTarefa = `Tarefa nº ${saida.listaNumeroTarefaSaida[0].numeroTarefa}`
            else if (saida.listaNumeroTarefaSaida.length > 1) {
                const listaTarefa = saida.listaNumeroTarefaSaida.map(tarefa => tarefa.numeroTarefa)
                obj.numeroTarefa = `Tarefas nº ${listaTarefa.join(', ')}`
            }
                
            obj.numeroAlteracao = saida.listaArtefatoSaida.length

            obj.listaNomeArtefato = saida.listaArtefatoSaida.map(artefato =>
                artefato.nomeArtefato
            ).join('\n')

            listaRetorno.push(obj)

            return listaRetorno
        }, [])

        const parser = new Parser({ fields });
        const csv = parser.parse(listaSaidaCVS);

        return csv
    }
}