function buscarCodigoGerenciadorComponentes(listaArquivos,prefixoIdentificador) {
  let codigo  = "def lIdentificadores = [\n"

  for(let i = 0; i < listaArquivos.length; i++){
    if(i === listaArquivos.length - 1){
      codigo += (`[nome: ${listaArquivos[i]}, identificador: {importar("${prefixoIdentificador + listaArquivos[i].toLowerCase()}")}, modulo: ""]\n`)
    }else{
      codigo += (`[nome: ${listaArquivos[i]}, identificador: {importar("${prefixoIdentificador + listaArquivos[i].toLowerCase()}")}, modulo: ""],\n`)
    }
  }

  codigo += ("]\n")

  codigo += `
  def buscar = { lModulos = [] , lAssuntos = [] ->
    lIdentificadoresRetorno = [];
    
    // Gerar todos
    if(lModulos.isEmpty() && lAssuntos.isEmpty()){
      return lIdentificadores
    }
    
    // Gera assuntos específicos
    if(lModulos.isEmpty() && !lAssuntos.isEmpty()){
      lAssuntos.each{ assunto ->
        lIdentificadoresRetorno << lIdentificadores.find{ it-> it.nome == assunto}?:[]
      }
      
      return lIdentificadoresRetorno
    }
    
    // Gera módulos específicos
    if(!lModulos.isEmpty() && lAssuntos.isEmpty()){
      lModulos.each{ modulo ->
        lIdentificadores.findAll{ it -> modulo.contains(it.modulo)}.each{
          lIdentificadoresRetorno << it
        }
      }
      
      return lIdentificadoresRetorno
    }
    
    // Gera assuntos específicos de módulos específicos
    if(!lModulos.isEmpty() && !lAssuntos.isEmpty()){
      lAssuntos.each{ assunto ->
        identificador = lIdentificadores.find{ it-> it.nome == assunto}?:""
        if(identificador){
          if(lModulos.findAll{ it-> it == identificador.modulo}){
            lIdentificadoresRetorno << identificador
          }
        }
      }
      
      return lIdentificadoresRetorno
    }
  }
  
  def filtrarPorTipoEnvio = { tipoEnvio ->
    lIdentificadores.removeAll{ !it.tipoEnvio.contains(tipoEnvio)}
  }
  
  def removerAssuntos = { assuntosRemover ->
    for(def assunto: assuntosRemover){
      lIdentificadores.removeIf{ it.nome == assunto}
    }
  }
  
  def buscarQuantidadeArquivos = { 
    return lIdentificadores.size()
  }
  
  Scripts.exportar(
    buscar: buscar,
    buscarQuantidadeArquivos: buscarQuantidadeArquivos,
    removerAssuntos: removerAssuntos,
    filtrarPorTipoEnvio: filtrarPorTipoEnvio
  )
  `

  return codigo
}

function buscarCodigoCentralizadorUtilitarios(prefixo) {
  let codigo = `
  lComponentes = []
  
  // Utilitários genéricos
  lComponentes << [nome: "${prefixo}pdc_log",     instancia: importar("${prefixo}pdc_log")]
  lComponentes << [nome: "${prefixo}pdc_tipos",   instancia: importar("${prefixo}pdc_tipos")]
  lComponentes << [nome: "${prefixo}pdc_datas",   instancia: importar("${prefixo}pdc_datas")]
  lComponentes << [nome: "${prefixo}pdc_mapas",   instancia: importar("${prefixo}pdc_mapas")]
  lComponentes << [nome: "${prefixo}pdc_api",     instancia: importar("${prefixo}pdc_api")]
  lComponentes << [nome: "${prefixo}pdc_numeros", instancia: importar("${prefixo}pdc_numeros")]
  
  // Gerador de pré-validações
  lComponentes << [nome: "${prefixo}util_prevalidacoes", instancia: importar("${prefixo}util_prevalidacoes")]
  
  // Utilitários
  lComponentes << [nome: "${prefixo}pdc_configuracao_recursos", instancia: importar("${prefixo}pdc_configuracao_recursos")]
  lComponentes << [nome: "${prefixo}utilitarios_url_cloud",     instancia: importar("${prefixo}utilitarios_url_cloud")]
  lComponentes << [nome: "${prefixo}pdc_utilitarios_cloud",     instancia: importar("${prefixo}pdc_utilitarios_cloud")]
  
  def getInstance = { nome ->
  return lComponentes.find{it.nome.toLowerCase() == nome.toLowerCase()}.instancia
  }
  
  def setComponente = { instance, nome ->
  lComponentes << [nome: nome, instancia: instance] 
  }
  
  Scripts.exportar(
  getInstance: getInstance,
  setComponente: setComponente
  )
  `;
  return codigo;
}

function buscarCodigoLogs(tipos, mapas, textos) {
  let codigoLogs = `
      tipos = importar "${tipos}"
      mapas = importar "${mapas}"
      textos = importar "${textos}"
      `;
  return codigoLogs;
}

function buscaCodigoTextos(identificadorTipos) {
  let codigoTextos = `
    tipos = importar "${identificadorTipos}"
  
    isTexto = { valor ->
    retornar tipos.isTexto(valor)
    } 
  
    pegarEntre = { texto, l, r, truncarEspacos = false, ultimo = false ->
    start = ultimo ? texto.lastIndexOf(l) : texto.indexOf(l) 
    resultado = start > 0 ?
            r ? texto.substring(start + l.length(), ultimo ? texto.lastIndexOf(r) : texto.indexOf(r)) : texto.substring(start + l.length()) 
                  : texto
    retornar truncarEspacos ? resultado.trim() : resultado
    }
  
    pegarUltimoEntre = { texto, l, r, truncarEspacos = false ->
    retornar pegarEntre(texto, l, r, truncarEspacos, true)
    }
  
    Scripts.exportar( 
    isTexto: isTexto,
    cp1251_ci_as: cp1251_ci_as,
    cpSimam: cpSimam,
    cpSicom: cpSicom,
    pegarEntre: pegarEntre,
    pegarUltimoEntre: pegarUltimoEntre
    )
    `;

  return codigoTextos;
}

function buscaCodigoMapas(identificadorTipos) {
  let codigoMapas = `
    tipos = importar "${identificadorTipos}"
    
    mescla = { maps ->
    resultado = [:]
  
    if (maps) {
    maps.each { map -> resultado << map }
    }
  
    return resultado
    }
    
    mesclaRecursivo = { maps ->
    resultado = [:]
  
    if (maps) {
    maps.each { map ->
    map.each { k, v -> resultado[k] = resultado[k] instanceof Map ? mescla(resultado[k], v) : v }
    }
    }
  
    return resultado
    }
    
    buscaValor = { map, campos ->
    buscaValor = { subMap, listaCampos ->
    percorrer(listaCampos) { item, index ->
    valor = subMap[item]
  
    se (tipos.isRegistroAtivo(valor) || tipos.isMapa(valor)) {
    buscaValor(valor, listaCampos.subList(index + 1, listaCampos.size()))  
    }
  
    parar()
    }
    
    retornar valor
    }
  
    retornar buscaValor(map, campos.expressao(~/\\./).dividir())
    }
    
    pegaValorSeExisteChave = { mapa, chave, padrao  ->
    return !tipos.isMapa(mapa) ? padrao : mapa.containsKey(chave) ? mapa[chave] : padrao
    }
    
    somaValor = { mapa, atributo, valor ->
    imprimir "Valor do mapa: $mapa"
    imprimir "Valor do Atributo: $atributo"
    imprimir "Valor do valor: $valor"
  
    return mapa.put(atributo,(mapa.get(atributo)?:0 + valor))
    }
    
    isMapa = { valor ->
    return tipos.isMapa(valor)
    }
    
    Scripts.exportar( 
    somaValor: somaValor,
    isMapa: isMapa,
    mescla: mescla,
    mesclaRecursivo: mesclaRecursivo,
    buscaValor: buscaValor,
    pegaValorSeExisteChave: pegaValorSeExisteChave
    )
   `;
  return codigoMapas;
}

function buscaCodigoTipos() {
  let codigoTipos = `
      seNulo = { valor, valorSeNulo ->
      return valor ?: valorSeNulo
      } 
        
      seVazio = { valor, valorSeVazio ->
      return valor.vazio() ? valorSeVazio : valor
      } 
        
      seNuloOuVazio = { valor, valorSeNuloOuVazio ->
      return seVazio(seNulo(valor, valorSeNuloOuVazio), valorSeNuloOuVazio)
      } 
        
      nuloParaZero = { valor ->
      return seNulo(valor, 0)
      } 
        
      nuloParaVazio = { valor ->
      return seNulo(valor, "")
      } 
        
      vazioParaZero = { valor ->
      return seVazio(valor, 0)
      } 
        
      isLista = { valor ->
      return valor instanceof List || valor instanceof Collection
      } 
        
      isMapa = { valor ->
      return valor instanceof Map
      } 
        
      isTexto = { valor ->
      return valor instanceof String
      } 
        
      isData = { valor ->
      return valor instanceof Date
      } 
        
      isNumero = { valor ->
      retornar valor instanceof Number
      } 
        
      isAtivo = { valor ->
      return valor.getClass().toString().contains("com.betha.suite.dados.Ativo")
      } 
        
      isRegistroAtivo = { valor ->
      return valor.getClass().toString().contains("com.betha.suite.dados.RegistroAtivo")
      } 
        
      isArquivo = { valor ->
      return valor.getClass().toString().contains("com.betha.bfc.script.api.arquivos.padrao.CsvFileApi")
      } 
        
      isMesmaClasse = { l, r ->
      return l.getClass() == r.getClass() || l.getClass() in r.getClass() || r.getClass() in l.getClass()
      } 
        
      isColecao = { valor ->
      return isAtivo(valor) || isLista(valor)
      } 
        
      ativoParaColecao = { params ->
      resultado = []
          
      if (isAtivo(params.ativo)) {
      if (params.chave && params.valor) {
      resultado = params.ativo.collectEntries { r -> [r[params.chave], r[params.valor]] }
      } else {
      resultado.addAll(params.ativo)
      }
      return resultado
      }
      return params.ativo
      } 
        
      Scripts.exportar( 
      nuloParaZero: nuloParaZero,
      vazioParaZero: vazioParaZero,
      nuloParaVazio: nuloParaVazio,  
      seNuloOuVazio: seNuloOuVazio,
      seNulo: seNulo,
      seVazio: seVazio,
      isLista: isLista,
      isMapa: isMapa,
      isTexto: isTexto,
      isData: isData,
      isNumero: isNumero,
      isAtivo: isAtivo,
      isRegistroAtivo: isRegistroAtivo,
      isArquivo: isArquivo,
      isMesmaClasse: isMesmaClasse,
      isColecao: isColecao,
      ativoParaColecao: ativoParaColecao
      )
    `;
  return codigoTipos;
}
