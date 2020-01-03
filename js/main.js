let contentType = "application/json";
let bearerToken = undefined;
let userAcess = undefined;
let idRascunho = undefined;
let tituloRascunho = undefined;
let idEntidade = undefined;
let idPublicacao = undefined;
let tipoGeracao = "individual";

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
    try {
      let rasc = await gerarRascunho(
        $("#formPrefixoNome").val() + $("#formNomeArquivo").val()
      );
      idRascunho = rasc.id;
      tituloRascunho = rasc.titulo;
      idEntidade = rasc.entidadeId;

      let codigo = $("#formCodigo")
        .val()
        .replace("NOMEDOARQUIVOTEMPLATE", $("#formNomeArquivo").val());

      let ger = await gerarCodigo(codigo, idRascunho);

      let pub = await publicarCodigo(idRascunho);
      idPublicacao = pub.id;

      let prefixoIdentificador = $("#formPrefixoIdentificador").val();
      for (let i = 0; i < 15; i++) {
        titulo = titulo.replace(" ", "_");
      }

      let identificador =
        prefixoIdentificador +
        $("#formNomeArquivo")
          .val()
          .toLowerCase();
      let save = await salvarIdentificador(identificador, idPublicacao);
      toastr.success("Script gerado com sucesso!");
    } catch (error) {
      document.querySelector("#botaoSalvar").removeAttribute("disabled");
    }
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

        let rasc = await gerarRascunho($("#formPrefixoNome").val() + arquivo);
        idRascunho = rasc.id;
        tituloRascunho = rasc.titulo;
        idEntidade = rasc.entidadeId;

        let codigo = $("#formCodigo")
          .val()
          .replace("NOMEDOARQUIVOTEMPLATE", arquivo);

        let ger = await gerarCodigo(codigo, idRascunho);

        let pub = await publicarCodigo(idRascunho);
        idPublicacao = pub.id;

        let prefixoIdentificador = $("#formPrefixoIdentificador").val();
        let tituloArq = arquivo;
        for (let i = 0; i < 15; i++) {
          tituloArq = tituloArq.replace(" ", "_");
        }

        let identificador = prefixoIdentificador + tituloArq.toLowerCase();
        let save = await salvarIdentificador(identificador, idPublicacao);

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
      }
    }
  } else if (tipoGeracao === "tiposmapastextos") {
    try {
      let tipos = ["Tipos", "Mapas", "Textos"];
      for (let i = 0; i < tipos.length; i++) {
        let nomeConfig = $("#formPrefixoNome").val();
        let tituloArq = nomeConfig + " " + tipos[i];

        let rasc = await gerarRascunho(tituloArq);
        idRascunho = rasc.id;
        tituloRascunho = rasc.titulo;
        idEntidade = rasc.entidadeId;
        let prefixoIdentificador = $("#formPrefixoIdentificador").val();

        if (i === 0) {
          let ger = await gerarCodigo(buscaCodigoTipos(), idRascunho);
        } else if (i === 1) {
          let ger = await gerarCodigo(
            buscaCodigoMapas(prefixoIdentificador + "pdc_tipos"),
            idRascunho
          );
        } else if (i === 2) {
          let ger = await gerarCodigo(
            buscaCodigoTextos(prefixoIdentificador + "pdc_tipos"),
            idRascunho
          );
        }

        let pub = await publicarCodigo(idRascunho);
        idPublicacao = pub.id;

        let identificador = "";
        if (i === 0) {
          identificador = prefixoIdentificador + "pdc_tipos";
        } else if (i === 1) {
          identificador = prefixoIdentificador + "pdc_mapas";
        } else if (i === 2) {
          identificador = prefixoIdentificador + "pdc_textos";
        }

        let save = await salvarIdentificador(identificador, idPublicacao);
        toastr.success("Script gerado com sucesso!");
      }
    } catch (error) {
      document.querySelector("#botaoSalvar").removeAttribute("disabled");
    }
  } else if (tipoGeracao === "logs") {
    try {
      let tituloArq = $("#formPrefixoNome").val() + " Logs";

      let rasc = await gerarRascunho(tituloArq);
      idRascunho = rasc.id;
      tituloRascunho = rasc.titulo;
      idEntidade = rasc.entidadeId;
      let prefixoIdentificador = $("#formPrefixoIdentificador").val();
      let identTipos = prefixoIdentificador + "pdc_tipos";
      let identMapas = prefixoIdentificador + "pdc_mapas";
      let identTextos = prefixoIdentificador + "pdc_textos";

      let ger = await gerarCodigo(
        buscarCodigoLogs(identTipos, identMapas, identTextos),
        idRascunho
      );

      let pub = await publicarCodigo(idRascunho);
      idPublicacao = pub.id;

      let identificador = prefixoIdentificador + "pdc_logs";

      let save = await salvarIdentificador(identificador, idPublicacao);
      toastr.success("Script gerado com sucesso!");
    } catch (error) {
      document.querySelector("#botaoSalvar").removeAttribute("disabled");
    }
  } else if (tipoGeracao === "centralizadorutilitarios") {
    try {
      let tituloArq = $("#formPrefixoNome").val() + " Centralizador de Utilitários";

      let rasc = await gerarRascunho(tituloArq);
      idRascunho = rasc.id;
      tituloRascunho = rasc.titulo;
      idEntidade = rasc.entidadeId;
      let prefixoIdentificador = $("#formPrefixoIdentificador").val();

      let ger = await gerarCodigo(
        buscarCodigoCentralizadorUtilitarios(prefixoIdentificador),
        idRascunho
      );

      let pub = await publicarCodigo(idRascunho);
      idPublicacao = pub.id;

      let identificador =
        prefixoIdentificador + "utilitarios_componentes_cloud";

      let save = await salvarIdentificador(identificador, idPublicacao);
      toastr.success("Script gerado com sucesso!");
    } catch (error) {
      document.querySelector("#botaoSalvar").removeAttribute("disabled");
    }
  } else if (tipoGeracao === "gerenciadorcomponentes") {
    try {
      let arquivos = $("#formListaArquivos")
      .val()
      .toString()
      .trim()
      .replace(/(\r\n|\n|\r)/gm, "")
      .split(";");

      let tituloArq = $("#formPrefixoNome").val() + " Gerenciador de Identificadores";

      let rasc = await gerarRascunho(tituloArq);
      idRascunho = rasc.id;
      tituloRascunho = rasc.titulo;
      idEntidade = rasc.entidadeId;
      let prefixoIdentificador = $("#formPrefixoIdentificador").val();

      let ger = await gerarCodigo(
        buscarCodigoGerenciadorComponentes(arquivos,prefixoIdentificador),
        idRascunho
      );

      let pub = await publicarCodigo(idRascunho);
      idPublicacao = pub.id;

      let identificador =
        prefixoIdentificador + "utilitarios_identificadores";

      let save = await salvarIdentificador(identificador, idPublicacao);
      toastr.success("Script gerado com sucesso!");
    } catch (error) {
      document.querySelector("#botaoSalvar").removeAttribute("disabled");
    }
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
      "user-access": userAcess
    },
    success: data => {
      $("#formListaLogs").val(
        $("#formListaLogs").val() +
          "\n" +
          buscarDataHoraAtual() +
          " Sucesso ao criar rascunho"
      );
    },
    error: function(xhr, ajaxOptions, thrownError) {
      $("#formListaLogs").val(
        $("#formListaLogs").val() +
          "\n" +
          buscarDataHoraAtual() +
          " ERRO: " +
          xhr.responseText
      );
      let error = JSON.parse(xhr.responseText);
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
          "user-access": userAcess
        },
        success: function(data) {
          $("#formListaLogs").val(
            $("#formListaLogs").val() +
              "\n" +
              buscarDataHoraAtual() +
              " Código compilado com sucesso"
          );
        },
        error: function(xhr, ajaxOptions, thrownError) {
          $("#formListaLogs").val(
            $("#formListaLogs").val() +
              "\n" +
              buscarDataHoraAtual() +
              " ERRO: " +
              xhr.responseText
          );
          let error = JSON.parse(xhr.responseText);
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
        "user-access": userAcess
      },
      success: function(data) {
        $("#formListaLogs").val(
          $("#formListaLogs").val() +
            "\n" +
            buscarDataHoraAtual() +
            " Código publicado com sucesso"
        );
      },
      error: function(xhr, ajaxOptions, thrownError) {
        $("#formListaLogs").val(
          $("#formListaLogs").val() +
            "\n" +
            buscarDataHoraAtual() +
            " ERRO: " +
            xhr.responseText
        );
        let error = JSON.parse(xhr.responseText);
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
        "user-access": userAcess
      },
      success: function(data) {
        $("#formListaLogs").val(
          $("#formListaLogs").val() +
            "\n" +
            buscarDataHoraAtual() +
            " Identificador salvo com sucesso"
        );
      },
      error: function(xhr, ajaxOptions, thrownError) {
        $("#formListaLogs").val(
          $("#formListaLogs").val() +
            "\n" +
            buscarDataHoraAtual() +
            " ERRO: " +
            xhr.responseText
        );
        let error = JSON.parse(xhr.responseText);
        toastr.error(xhr.status + "-" + error.message);
      }
    });
  }
}
