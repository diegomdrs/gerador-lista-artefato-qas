const Tarefa = function ({
    numeroTarefa,
    descricaoTarefa,
    hash,
    listaArtefato
}) {
    this.numeroTarefa = numeroTarefa
    this.descricaoTarefa = descricaoTarefa
    this.hash = hash
    this.listaArtefato = listaArtefato

    return this
}

module.exports = Tarefa