let contentType = "application/json";
let bearerToken = undefined;
let userAcess = undefined;
let idRascunho = undefined;
let tituloRascunho = undefined;
let idEntidade = undefined;
let idPublicacao = undefined;
let tipoGeracao = "individual";

async function salvar() {
  if(document.querySelector("#botaoSalvar").getAttribute('disabled') === 'true'){
    toastr.error("Aguarde o término do processamento");
    return;
  }

  document.querySelector("#botaoSalvar").setAttribute('disabled','true')
  document.querySelector("#progressoInterno").style.width = "0%";
  document.querySelector("#progressoInterno").innerText = "0%";

  if ($("#formNomeArquivo").val() === "" && tipoGeracao === "individual") {
    toastr.error("Nome do arquivo não informado");
    document.querySelector("#botaoSalvar").removeAttribute('disabled')
    return;
  }

  if ($("#formListaArquivos").val() === "" && tipoGeracao === "lista") {
    toastr.error("Nenhum arquivo informado");
    document.querySelector("#botaoSalvar").removeAttribute('disabled')
    return;
  }

  if ($("#formBearer").val() === "") {
    toastr.error("Token não informado");
    document.querySelector("#botaoSalvar").removeAttribute('disabled')
    return;
  }

  if ($("#formUserAcess").val() === "") {
    toastr.error("UserAcess não informado");
    document.querySelector("#botaoSalvar").removeAttribute('disabled')
    return;
  }

  if ($("#formPrefixoNome").val() === "") {
    toastr.error("Prefixo do Nome não informado");
    document.querySelector("#botaoSalvar").removeAttribute('disabled')
    return;
  }

  if ($("#formPrefixoIdentificador").val() === "") {
    toastr.error("Prefixo do Identificador não informado");
    document.querySelector("#botaoSalvar").removeAttribute('disabled')
    return;
  }

  if ($("#formCodigo").val() === "") {
    toastr.error("Template de código não informado");
    document.querySelector("#botaoSalvar").removeAttribute('disabled')
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
  } else {
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

        await new Promise(r => setTimeout(r, 5000));
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
        console.log(`Ocorreu um erro ao gerar: ${arquivo} -> ${error}`);
      }
    }
  }
  document.querySelector("#botaoSalvar").removeAttribute('disabled')
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
  }
}

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
