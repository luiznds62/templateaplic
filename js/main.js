let contentType = "application/json";
var bearerToken = undefined;
var userAcess = undefined;
var idRascunho = undefined;
var tituloRascunho = undefined;
var idEntidade = undefined;
var idPublicacao = undefined;

async function salvar() {
  try {
    if ($("#formNomeArquivo").val() === "") {
      toastr.error("Nome do arquivo não informado");
      return;
    }

    if ($("#formBearer").val() === "") {
      toastr.error("Token não informado");
      return;
    }

    if ($("#formUserAcess").val() === "") {
      toastr.error("UserAcess não informado");
      return;
    }

    if ($("#formPrefixoNome").val() === "") {
      toastr.error("Prefixo do Nome não informado");
      return;
    }

    if ($("#formPrefixoIdentificador").val() === "") {
      toastr.error("Prefixo do Identificador não informado");
      return;
    }

    if ($("#formCodigo").val() === "") {
      toastr.error("Template de código não informado");
      return;
    }

    var rasc = await gerarRascunho();
    idRascunho = rasc.id;
    tituloRascunho = rasc.titulo;
    idEntidade = rasc.entidadeId;

    var ger = await gerarCodigo();

    var pub = await publicarCodigo();
    idPublicacao = pub.id;

    var save = await salvarIdentificador();

    toastr.success("Script gerado com sucesso!");
  } catch (error) {
    //toastr.error("Ocorreu um erro ao gerar o script:");
  }
}

async function gerarRascunho() {
  bearerToken = $("#formBearer").val();
  userAcess = $("#formUserAcess").val();

  let nomeConfig = $("#formPrefixoNome").val();
  var titulo = nomeConfig + $("#formNomeArquivo").val();

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
      console.log("Sucesso ao criar rascunho");
    },
    error: function(xhr, ajaxOptions, thrownError) {
      var error = JSON.parse(xhr.responseText);
      toastr.error(xhr.status + "-" + error.message);
    }
  });
}

async function gerarCodigo() {
  let nomeArquivo = $("#formNomeArquivo").val();
  let template = $("#formCodigo").val();

  var codigo = template.replace("NOMEDOARQUIVOTEMPLATE", nomeArquivo);

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
          console.log("Código compilado com sucesso");
        },
        error: function(xhr, ajaxOptions, thrownError) {
          var error = JSON.parse(xhr.responseText);
          toastr.error(xhr.status + "-" + error.message);
        }
      });
    }
  }
}

async function publicarCodigo() {
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
        console.log("Código publicado com sucesso");
      },
      error: function(xhr, ajaxOptions, thrownError) {
        var error = JSON.parse(xhr.responseText);
        toastr.error(xhr.status + "-" + error.message);
      }
    });
  }
}

async function salvarIdentificador() {
  let prefixoIdentificador = $("#formPrefixoIdentificador").val();
  var titulo = $("#formNomeArquivo").val();
  for (var i = 0; i < 15; i++) {
    titulo = titulo.replace(" ", "_");
  }

  titulo = prefixoIdentificador + titulo.toLowerCase();

  if (idPublicacao) {
    return $.ajax({
      url: `https://scripts.cloud.betha.com.br/scripts/v1/api/scripts/${idPublicacao}/identificador`,
      type: "PUT",
      data: titulo,
      headers: {
        authorization: bearerToken,
        // "origin": "https://prestacao-contas.cloud.betha.com.br",
        // "referer": "https://prestacao-contas.cloud.betha.com.br/",
        // "sec-fetch-mode": "cors",
        // "sec-fetch-site": "same-site",
        "user-access": userAcess
      },
      success: function(data) {
        console.log("Identificador salvo com sucesso");
      },
      error: function(xhr, ajaxOptions, thrownError) {
        var error = JSON.parse(xhr.responseText);
        toastr.error(xhr.status + "-" + error.message);
      }
    });
  }
}

function mostrarPrincipal() {
  document.querySelector("#principal").style.display = "block";
  document.querySelector("#configuracao").style.display = "none";
}

function mostrarConfiguracoes() {
  document.querySelector("#principal").style.display = "none";
  document.querySelector("#configuracao").style.display = "block";
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

// function enviarPesquisa() {
//   var nome = $("#formNome").val();
//   var pergunta1 = $("#formPergunta1")
//     .find(":selected")
//     .val();
//   var pergunta2 = $("#formPergunta2")
//     .find(":selected")
//     .val();
//   var nota = $("#formNota")
//     .find(":selected")
//     .val();
//   var comentario = $("#formComentario").val();

//   if (!nome) {
//     alert("É necessário informar o nome");
//     return;
//   }

//   $.post(
//     "https://pesquisasatisfacao.herokuapp.com/",
//     {
//       nome: nome,
//       pergunta1: pergunta1,
//       pergunta2: pergunta2,
//       nota: nota,
//       comentario: comentario
//     },
//     function(result) {
//       if (result === "Sucesso!") {
//         alert(result);
//         $("#formNome").val("");
//         $("#formComentario").val("");
//         $("#formPergunta1").prop("selectedIndex", 0);
//         $("#formPergunta2").prop("selectedIndex", 0);
//         $("#formNota").prop("selectedIndex", 0);
//       } else {
//         alert("Erro");
//       }
//     }
//   );
// }
