const Tarefa = function ({
    numeroTarefa,
    descricaoTarefa,
    listaArtefato
}) {
    this.numeroTarefa = numeroTarefa
    this.descricaoTarefa = descricaoTarefa
    this.listaArtefato = listaArtefato

    return this
}

module.exports = Tarefa