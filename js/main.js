let contentType = "application/json";
let bearerToken = undefined;
let userAcess = undefined;
let idRascunho = undefined;
let tituloRascunho = undefined;
let idEntidade = undefined;
let idPublicacao = undefined;
let tipoGeracao = "individual";

function mostrarIndividual() {
  document.querySelector("#individual").style.display = "block";
  document.querySelector("#listaArquivos").style.display = "none";
  document.querySelector("#progressoLista").style.display = "none";
  document.querySelector("#botaoLog").style.display = "none";
}

function mostrarListaArquivos() {
  document.querySelector("#individual").style.display = "none";
  document.querySelector("#listaArquivos").style.display = "block";
  document.querySelector("#progressoLista").style.display = "block";
  document.querySelector("#botaoLog").style.display = "inline";
}

function mostrarTipoMapasTextos() {
  document.querySelector("#individual").style.display = "none";
  document.querySelector("#listaArquivos").style.display = "none";
  document.querySelector("#progressoLista").style.display = "none";
  document.querySelector("#botaoLog").style.display = "inline";
}

function mostrarComponenteLogs() {
  document.querySelector("#individual").style.display = "none";
  document.querySelector("#listaArquivos").style.display = "none";
  document.querySelector("#progressoLista").style.display = "none";
  document.querySelector("#botaoLog").style.display = "inline";
}

function mostrarCentralizador() {
  document.querySelector("#individual").style.display = "none";
  document.querySelector("#listaArquivos").style.display = "none";
  document.querySelector("#progressoLista").style.display = "none";
  document.querySelector("#botaoLog").style.display = "inline";
}

function mostrarPrincipal() {
  document.querySelector("#principal").style.display = "block";
  document.querySelector("#configuracao").style.display = "none";
}

function mostrarConfiguracoes() {
  document.querySelector("#principal").style.display = "none";
  document.querySelector("#configuracao").style.display = "block";
}

function mostrarLogs() {
  document.querySelector("#modalLog").style.display = "block";
}

function buscarCodigoCentralizadorUtilitarios(prefixo) {
  codigo = `
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
  codigoLogs = `
    tipos = importar "${tipos}"
    mapas = importar "${mapas}"
    textos = importar "${textos}"
    `;
  return codigoLogs;
}

function buscaCodigoTextos(identificadorTipos) {
  codigoTextos = `
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
  codigoMapas = `
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
  codigoTipos = `
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

async function salvar() {
  if (
    document.querySelector("#botaoSalvar").getAttribute("disabled") === "true"
  ) {
    toastr.error("Aguarde o término do processamento");
    return;
  }

  document.querySelector("#botaoSalvar").setAttribute("disabled", "true");
  document.querySelector("#progressoInterno").style.width = "0%";
  document.querySelector("#progressoInterno").innerText = "0%";

  if ($("#formNomeArquivo").val() === "" && tipoGeracao === "individual") {
    toastr.error("Nome do arquivo não informado");
    document.querySelector("#botaoSalvar").removeAttribute("disabled");
    return;
  }

  if ($("#formListaArquivos").val() === "" && tipoGeracao === "lista") {
    toastr.error("Nenhum arquivo informado");
    document.querySelector("#botaoSalvar").removeAttribute("disabled");
    return;
  }

  if ($("#formBearer").val() === "") {
    toastr.error("Token não informado");
    document.querySelector("#botaoSalvar").removeAttribute("disabled");
    return;
  }

  if ($("#formUserAcess").val() === "") {
    toastr.error("UserAcess não informado");
    document.querySelector("#botaoSalvar").removeAttribute("disabled");
    return;
  }

  if ($("#formPrefixoNome").val() === "") {
    toastr.error("Prefixo do Nome não informado");
    document.querySelector("#botaoSalvar").removeAttribute("disabled");
    return;
  }

  if ($("#formPrefixoIdentificador").val() === "") {
    toastr.error("Prefixo do Identificador não informado");
    document.querySelector("#botaoSalvar").removeAttribute("disabled");
    return;
  }

  if (
    $("#formCodigo").val() === "" &&
    (tipoGeracao === "individual" || tipoGeracao === "lista")
  ) {
    toastr.error("Template de código não informado");
    document.querySelector("#botaoSalvar").removeAttribute("disabled");
    return;
  }

  if (tipoGeracao === "individual") {
    let nomeConfig = $("#formPrefixoNome").val();
    var tituloArq = nomeConfig + $("#formNomeArquivo").val();

    var rasc = await gerarRascunho(tituloArq);
    idRascunho = rasc.id;
    tituloRascunho = rasc.titulo;
    idEntidade = rasc.entidadeId;

    let nomeArquivo = $("#formNomeArquivo").val();
    let template = $("#formCodigo").val();

    let codigo = template.replace("NOMEDOARQUIVOTEMPLATE", nomeArquivo);

    var ger = await gerarCodigo(codigo, idRascunho);

    var pub = await publicarCodigo(idRascunho);
    idPublicacao = pub.id;

    let prefixoIdentificador = $("#formPrefixoIdentificador").val();
    let titulo = $("#formNomeArquivo").val();
    for (let i = 0; i < 15; i++) {
      titulo = titulo.replace(" ", "_");
    }

    let identificador = prefixoIdentificador + titulo.toLowerCase();
    var save = await salvarIdentificador(identificador, idPublicacao);
    toastr.success("Script gerado com sucesso!");
  } else if (tipoGeracao === "lista") {
    let arquivos = $("#formListaArquivos")
      .val()
      .toString()
      .trim()
      .replace(/(\r\n|\n|\r)/gm, "")
      .split(";");

    let tamanhoProgresso = 100 / arquivos.length;

    for (let i = 0; i < arquivos.length; i++) {
      arquivo = arquivos[i];
      if ($("#formListaLogs").val() == "") {
        $("#formListaLogs").val(buscarDataHoraAtual() + " GERAÇÃO: " + arquivo);
      } else {
        $("#formListaLogs").val(
          $("#formListaLogs").val() +
            "\n" +
            buscarDataHoraAtual() +
            " GERAÇÃO: " +
            arquivo
        );
      }

      try {
        if (arquivo == "") {
          return;
        }

        if (arquivo.includes('"')) {
          toastr.error("Nome do arquivo não pode conter caracteres especiais");
          return;
        }

        let nomeConfig = $("#formPrefixoNome").val();
        var titulo = nomeConfig + arquivo;

        var rasc = await gerarRascunho(titulo);
        idRascunho = rasc.id;
        tituloRascunho = rasc.titulo;
        idEntidade = rasc.entidadeId;

        let template = $("#formCodigo").val();
        let codigo = template.replace("NOMEDOARQUIVOTEMPLATE", arquivo);

        var ger = await gerarCodigo(codigo, idRascunho);

        var pub = await publicarCodigo(idRascunho);
        idPublicacao = pub.id;

        let prefixoIdentificador = $("#formPrefixoIdentificador").val();
        let tituloArq = arquivo;
        for (let i = 0; i < 15; i++) {
          tituloArq = tituloArq.replace(" ", "_");
        }

        let identificador = prefixoIdentificador + tituloArq.toLowerCase();
        var save = await salvarIdentificador(identificador, idPublicacao);

        await new Promise(r => setTimeout(r, 2000));
        toastr.success(`${arquivo} gerado com sucesso!`);
        let tamanhoAtual = Number(
          document
            .querySelector("#progressoInterno")
            .style.width.replace("%", "")
        );
        document.querySelector("#progressoInterno").style.width =
          Math.round(tamanhoAtual + tamanhoProgresso) + "%";
        document.querySelector("#progressoInterno").innerText =
          Math.round(tamanhoAtual + tamanhoProgresso) + "%";
      } catch (error) {
        document.querySelector("#botaoSalvar").removeAttribute("disabled");
        console.log(`Ocorreu um erro ao gerar: ${arquivo} -> ${error}`);
      }
    }
  } else if (tipoGeracao === "tiposmapastextos") {
    let tipos = ["Tipos", "Mapas", "Textos"];
    for (let i = 0; i < tipos.length; i++) {
      let nomeConfig = $("#formPrefixoNome").val();
      var tituloArq = nomeConfig + " " + tipos[i];

      var rasc = await gerarRascunho(tituloArq);
      idRascunho = rasc.id;
      tituloRascunho = rasc.titulo;
      idEntidade = rasc.entidadeId;
      let prefixoIdentificador = $("#formPrefixoIdentificador").val();

      if (i === 0) {
        var ger = await gerarCodigo(buscaCodigoTipos(), idRascunho);
      } else if (i === 1) {
        var ger = await gerarCodigo(
          buscaCodigoMapas(prefixoIdentificador + "pdc_tipos"),
          idRascunho
        );
      } else if (i === 2) {
        var ger = await gerarCodigo(
          buscaCodigoTextos(prefixoIdentificador + "pdc_tipos"),
          idRascunho
        );
      }

      var pub = await publicarCodigo(idRascunho);
      idPublicacao = pub.id;

      let identificador = "";
      if (i === 0) {
        identificador = prefixoIdentificador + "pdc_tipos";
      } else if (i === 1) {
        identificador = prefixoIdentificador + "pdc_mapas";
      } else if (i === 2) {
        identificador = prefixoIdentificador + "pdc_textos";
      }

      var save = await salvarIdentificador(identificador, idPublicacao);
      toastr.success("Script gerado com sucesso!");
    }
  } else if (tipoGeracao === "logs") {
    var tituloArq = $("#formPrefixoNome").val() + " Logs";

    var rasc = await gerarRascunho(tituloArq);
    idRascunho = rasc.id;
    tituloRascunho = rasc.titulo;
    idEntidade = rasc.entidadeId;
    let prefixoIdentificador = $("#formPrefixoIdentificador").val();
    let identTipos = prefixoIdentificador + "pdc_tipos";
    let identMapas = prefixoIdentificador + "pdc_mapas";
    let identTextos = prefixoIdentificador + "pdc_textos";

    var ger = await gerarCodigo(
      buscarCodigoLogs(identTipos, identMapas, identTextos),
      idRascunho
    );

    var pub = await publicarCodigo(idRascunho);
    idPublicacao = pub.id;

    let identificador = prefixoIdentificador + "pdc_logs";

    var save = await salvarIdentificador(identificador, idPublicacao);
    toastr.success("Script gerado com sucesso!");
  } else if (tipoGeracao === "centralizadorutilitarios") {
    var tituloArq =
      $("#formPrefixoNome").val() + " Centralizador de Utilitários";

    var rasc = await gerarRascunho(tituloArq);
    idRascunho = rasc.id;
    tituloRascunho = rasc.titulo;
    idEntidade = rasc.entidadeId;
    let prefixoIdentificador = $("#formPrefixoIdentificador").val();

    var ger = await gerarCodigo(buscarCodigoCentralizadorUtilitarios(prefixoIdentificador), idRascunho);

    var pub = await publicarCodigo(idRascunho);
    idPublicacao = pub.id;

    let identificador = prefixoIdentificador + "utilitarios_componentes_cloud";

    var save = await salvarIdentificador(identificador, idPublicacao);
    toastr.success("Script gerado com sucesso!");
  }

  document.querySelector("#progressoInterno").style.width = "100%";
  document.querySelector("#progressoInterno").innerText = "100%";
  document.querySelector("#botaoSalvar").removeAttribute("disabled");
}

function buscarDataHoraAtual() {
  let dataAtual = new Date();
  dataAtual =
    dataAtual.getFullYear() +
    "-" +
    dataAtual.getMonth() +
    "-" +
    dataAtual.getDate() +
    ":" +
    dataAtual.getHours() +
    ":" +
    dataAtual.getMinutes() +
    ":" +
    dataAtual.getSeconds();

  return dataAtual;
}

async function gerarRascunho(titulo) {
  bearerToken = $("#formBearer").val();
  userAcess = $("#formUserAcess").val();

  return $.ajax({
    url: "https://scripts.cloud.betha.com.br/scripts/v1/api/rascunhos",
    type: "post",
    data: JSON.stringify({
      eventos: [],
      titulo: titulo,
      chaveNatureza: null,
      tipoScript: {
        value: "P"
      },
      disponivelConsulta: false
    }),
    headers: {
      authorization: bearerToken,
      "Content-Type": contentType,
      // "origin": "https://prestacao-contas.cloud.betha.com.br",
      // "referer": "https://prestacao-contas.cloud.betha.com.br/",
      // "sec-fetch-mode": "cors",
      // "sec-fetch-site": "same-site",
      "user-access": userAcess
    },
    success: data => {
      $("#formListaLogs").val(
        $("#formListaLogs").val() +
          "\n" +
          buscarDataHoraAtual() +
          " Sucesso ao criar rascunho"
      );
      console.log("Sucesso ao criar rascunho");
    },
    error: function(xhr, ajaxOptions, thrownError) {
      $("#formListaLogs").val(
        $("#formListaLogs").val() +
          "\n" +
          buscarDataHoraAtual() +
          " ERRO: " +
          xhr.responseText
      );
      var error = JSON.parse(xhr.responseText);
      toastr.error(xhr.status + "-" + error.message);
    }
  });
}

async function gerarCodigo(codigo, idRascunho) {
  if (idRascunho) {
    if (codigo) {
      return $.ajax({
        url:
          "https://scripts.cloud.betha.com.br/scripts/v1/api/rascunhos/" +
          idRascunho,
        type: "put",
        data: JSON.stringify({
          id: idRascunho,
          revisao: null,
          entidadeId: idEntidade,
          sistemaId: 151,
          titulo: tituloRascunho,
          descricao: null,
          chaveNatureza: null,
          disponivelConsulta: false,
          descricaoNatureza: null,
          codigoFonte: codigo,
          tags: [],
          parametros: [],
          tipoScript: {
            value: "P",
            description: "Componente"
          },
          eventos: [],
          execucaoEventoAssincrono: false
        }),
        headers: {
          authorization: bearerToken,
          "Content-Type": contentType,
          // "origin": "https://prestacao-contas.cloud.betha.com.br",
          // "referer": "https://prestacao-contas.cloud.betha.com.br/",
          // "sec-fetch-mode": "cors",
          // "sec-fetch-site": "same-site",
          "user-access": userAcess
        },
        success: function(data) {
          $("#formListaLogs").val(
            $("#formListaLogs").val() +
              "\n" +
              buscarDataHoraAtual() +
              " Código compilado com sucesso"
          );
          console.log("Código compilado com sucesso");
        },
        error: function(xhr, ajaxOptions, thrownError) {
          $("#formListaLogs").val(
            $("#formListaLogs").val() +
              "\n" +
              buscarDataHoraAtual() +
              " ERRO: " +
              xhr.responseText
          );
          var error = JSON.parse(xhr.responseText);
          toastr.error(xhr.status + "-" + error.message);
        }
      });
    }
  }
}

async function publicarCodigo(idRascunho) {
  if (idRascunho) {
    return $.ajax({
      url: `https://scripts.cloud.betha.com.br/scripts/v1/api/rascunhos/${idRascunho}/acoes/publicar`,
      type: "post",
      headers: {
        authorization: bearerToken,
        "Content-Type": contentType,
        // "origin": "https://prestacao-contas.cloud.betha.com.br",
        // "referer": "https://prestacao-contas.cloud.betha.com.br/",
        // "sec-fetch-mode": "cors",
        // "sec-fetch-site": "same-site",
        "user-access": userAcess
      },
      success: function(data) {
        $("#formListaLogs").val(
          $("#formListaLogs").val() +
            "\n" +
            buscarDataHoraAtual() +
            " Código publicado com sucesso"
        );
        console.log("Código publicado com sucesso");
      },
      error: function(xhr, ajaxOptions, thrownError) {
        $("#formListaLogs").val(
          $("#formListaLogs").val() +
            "\n" +
            buscarDataHoraAtual() +
            " ERRO: " +
            xhr.responseText
        );
        var error = JSON.parse(xhr.responseText);
        toastr.error(xhr.status + "-" + error.message);
      }
    });
  }
}

async function salvarIdentificador(identificador, idPublicacao) {
  if (idPublicacao) {
    return $.ajax({
      url: `https://scripts.cloud.betha.com.br/scripts/v1/api/scripts/${idPublicacao}/identificador`,
      type: "PUT",
      data: identificador,
      headers: {
        authorization: bearerToken,
        // "origin": "https://prestacao-contas.cloud.betha.com.br",
        // "referer": "https://prestacao-contas.cloud.betha.com.br/",
        // "sec-fetch-mode": "cors",
        // "sec-fetch-site": "same-site",
        "user-access": userAcess
      },
      success: function(data) {
        $("#formListaLogs").val(
          $("#formListaLogs").val() +
            "\n" +
            buscarDataHoraAtual() +
            " Identificador salvo com sucesso"
        );
        console.log("Identificador salvo com sucesso");
      },
      error: function(xhr, ajaxOptions, thrownError) {
        $("#formListaLogs").val(
          $("#formListaLogs").val() +
            "\n" +
            buscarDataHoraAtual() +
            " ERRO: " +
            xhr.responseText
        );
        var error = JSON.parse(xhr.responseText);
        toastr.error(xhr.status + "-" + error.message);
      }
    });
  }
}

function alterarTipoGeracao(elem) {
  if (elem.selectedIndex === 0) {
    tipoGeracao = "individual";
    mostrarIndividual();
  } else if (elem.selectedIndex === 1) {
    tipoGeracao = "lista";
    mostrarListaArquivos();
  } else if (elem.selectedIndex === 2) {
    tipoGeracao = "gerenciadorcomponentes";
  } else if (elem.selectedIndex === 3) {
    tipoGeracao = "centralizadorutilitarios";
    mostrarCentralizador();
  } else if (elem.selectedIndex === 4) {
    tipoGeracao = "logs";
    mostrarComponenteLogs();
  } else if (elem.selectedIndex === 5) {
    tipoGeracao = "tiposmapastextos";
    mostrarTipoMapasTextos();
  }
}

function gerarTemplate() {
  let nomeArquivo = $("#formNomeArquivo").val();
  let template = $("#formCodigo").val();

  var codigo = template.replace("NOMEDOARQUIVOTEMPLATE", nomeArquivo);

  navigator.clipboard.writeText(codigo).then(
    function() {
      console.log("Async: Copiado com sucesso para o Clipboard!");
    },
    function(err) {
      console.error("Async: Erro ao copiar: ", err);
    }
  );
}

function gerarNome() {
  let nomeConfig = $("#formPrefixoNome").val();
  var titulo = nomeConfig + $("#formNomeArquivo").val();

  navigator.clipboard
    .writeText(titulo)
    .toUpperCase()
    .then(
      function() {
        console.log("Async: Copiado com sucesso para o Clipboard!");
      },
      function(err) {
        console.error("Async: Erro ao copiar: ", err);
      }
    );
}

function gerarIdentificador() {
  let prefixoIdentificador = $("#formPrefixoIdentificador").val();
  var titulo = $("#formNomeArquivo").val();
  for (var i = 0; i < 15; i++) {
    titulo = titulo.replace(" ", "_");
  }
  navigator.clipboard
    .writeText(prefixoIdentificador + titulo.toLowerCase())
    .then(
      function() {
        console.log("Async: Copiado com sucesso para o Clipboard!");
      },
      function(err) {
        console.error("Async: Erro ao copiar: ", err);
      }
    );
}

function escondeModal(id) {
  document.querySelector("#" + id).style.display = "none";
}
