const Comando = (caminhoProjeto, autor, listaTask, mostrarCommitsLocais) => {

    let comando = `git -C ${caminhoProjeto} log --reverse --regexp-ignore-case --no-merges --author=${autor}`

    comando = mostrarCommitsLocais
        ? comando.concat(' --branches')
        : comando.concat(' --remotes')

    // %H - commit hash
    // %h - abbreviated commit hash
    comando = comando.concat(
        ' --name-status --pretty=format:\'%h %s\' -C')

    for (const task of listaTask)
        comando = comando.concat(` --grep=${task}`)

    return comando
}

module.exports = Comando