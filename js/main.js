let contentType = "application/json";
let bearerToken = undefined;
let userAcess = undefined;
let idRascunho = undefined;
let tituloRascunho = undefined;
let idEntidade = undefined;
let idPublicacao = undefined;
let tipoGeracao = "individual";
let limiteReq = 100;

async function buscarComponentes(offset = 0) {
  return $.ajax({
    url: `https://scripts.cloud.betha.com.br/scripts/v1/api/componentes?limit=100&offset=${offset}`,
    type: "GET",
    headers: {
      authorization: $("#formBearer").val(),
      "Content-Type": contentType,
      "user-access": $("#formUserAcess").val()
    },
    success: data => {
      console.log("Retornados com sucesso");
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log("Erro ao buscar");
    }
  });
}

async function buscarScripts(offset = 0) {
  return $.ajax({
    url: `https://scripts.cloud.betha.com.br/scripts/v1/api/scripts?limit=100&offset=${offset}`,
    type: "GET",
    headers: {
      authorization: $("#formBearer").val(),
      "Content-Type": contentType,
      "user-access": $("#formUserAcess").val()
    },
    success: data => {
      console.log("Retornados com sucesso");
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log("Erro ao buscar");
    }
  });
}

async function buscarCriticas(offset = 0) {
  return $.ajax({
    url: `https://scripts.cloud.betha.com.br/scripts/v1/api/criticas?limit=100&offset=${offset}`,
    type: "GET",
    headers: {
      authorization: $("#formBearer").val(),
      "Content-Type": contentType,
      "user-access": $("#formUserAcess").val()
    },
    success: data => {
      console.log("Retornados com sucesso");
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log("Erro ao buscar");
    }
  });
}

async function buscarFontes(offset = 0) {
  return $.ajax({
    url: `https://scripts.cloud.betha.com.br/scripts/v1/api/fontes-dinamicas?limit=100&offset=${offset}`,
    type: "GET",
    headers: {
      authorization: $("#formBearer").val(),
      "Content-Type": contentType,
      "user-access": $("#formUserAcess").val()
    },
    success: data => {
      console.log("Retornados com sucesso");
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log("Erro ao buscar");
    }
  });
}

async function iniciarGeracao() {
  if (
    document.querySelector("#botaoGerarArquivos").getAttribute("disabled") ===
    "true"
  ) {
    toastr.error("Aguarde o término do processamento");
    return;
  }

  document.querySelector("#progressoListaDownload").style.width = "0%";
  document.querySelector("#progressoListaDownload").innerText = "0%";

  document
    .querySelector("#botaoGerarArquivos")
    .setAttribute("disabled", "true");

  if ($("#formBearer").val() === "") {
    toastr.error("Token não informado");
    document.querySelector("#botaoGerarArquivos").removeAttribute("disabled");
    return;
  }

  if ($("#formUserAcess").val() === "") {
    toastr.error("UserAcess não informado");
    document.querySelector("#botaoGerarArquivos").removeAttribute("disabled");
    return;
  }

  let dadosScripts = [];
  let dadosComponentes = [];
  let dadosCriticas = [];
  let dadosFontes = [];
  let existeProximo = true;
  let offset = 0;

  try {
    while (existeProximo) {
      let dadosReq = await buscarComponentes(offset);
      existeProximo = dadosReq.hasNext;
      if (existeProximo) {
        offset += limiteReq;
      }

      for (let i = 0; i < dadosReq.content.length; i++) {
        dadosComponentes.push(dadosReq.content[i]);
      }
    }

    offset = 0
    existeProximo = true
    while (existeProximo) {
      let dadosReq = await buscarScripts(offset);
      existeProximo = dadosReq.hasNext;
      if (existeProximo) {
        offset += limiteReq;
      }

      for (let i = 0; i < dadosReq.content.length; i++) {
        dadosScripts.push(dadosReq.content[i]);
      }
    }

    offset = 0
    existeProximo = true
    while (existeProximo) {
      let dadosReq = await buscarCriticas(offset);
      existeProximo = dadosReq.hasNext;
      if (existeProximo) {
        offset += limiteReq;
      }

      for (let i = 0; i < dadosReq.content.length; i++) {
        dadosCriticas.push(dadosReq.content[i]);
      }
    }

    offset = 0
    existeProximo = true
    while (existeProximo) {
      let dadosReq = await buscarFontes(offset);
      existeProximo = dadosReq.hasNext;
      if (existeProximo) {
        offset += limiteReq;
      }

      for (let i = 0; i < dadosReq.content.length; i++) {
        dadosFontes.push(dadosReq.content[i]);
      }
    }

  } catch (error) {
    toastr.error(error);
    document.querySelector("#botaoGerarArquivos").removeAttribute("disabled");
  }

  if(dadosComponentes.length != 0){
    tamanhoItem = 25 / dadosComponentes.length
  }else{
    tamanhoItem = 25
    let tamanhoAtual = Number(
      document
        .querySelector("#progressoListaDownload")
        .style.width.replace("%", "")
    );
    document.querySelector("#progressoListaDownload").style.width =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
    document.querySelector("#progressoListaDownload").innerText =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
  }

  for (let i = 0; i < dadosComponentes.length; i++) {
    adicionarComponente(
      dadosComponentes[i].revisao.codigoFonte,
      dadosComponentes[i].titulo
    );
    await new Promise(r => setTimeout(r, 50));
    let tamanhoAtual = Number(
      document
        .querySelector("#progressoListaDownload")
        .style.width.replace("%", "")
    );
    document.querySelector("#progressoListaDownload").style.width =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
    document.querySelector("#progressoListaDownload").innerText =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
  }

  if(dadosScripts.length != 0){
    tamanhoItem = 25 / dadosScripts.length
  }else{
    tamanhoItem = 25
    let tamanhoAtual = Number(
      document
        .querySelector("#progressoListaDownload")
        .style.width.replace("%", "")
    );
    document.querySelector("#progressoListaDownload").style.width =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
    document.querySelector("#progressoListaDownload").innerText =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
  }

  for (let i = 0; i < dadosScripts.length; i++) {
    adicionarScript(
      dadosScripts[i].revisao.codigoFonte,
      dadosScripts[i].titulo
    );
    await new Promise(r => setTimeout(r, 50));
    let tamanhoAtual = Number(
      document
        .querySelector("#progressoListaDownload")
        .style.width.replace("%", "")
    );
    document.querySelector("#progressoListaDownload").style.width =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
    document.querySelector("#progressoListaDownload").innerText =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
  }

  if(dadosCriticas.length != 0){
    tamanhoItem = 25 / dadosCriticas.length
  }else{
    tamanhoItem = 25
    let tamanhoAtual = Number(
      document
        .querySelector("#progressoListaDownload")
        .style.width.replace("%", "")
    );
    document.querySelector("#progressoListaDownload").style.width =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
    document.querySelector("#progressoListaDownload").innerText =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
  }

  for (let i = 0; i < dadosCriticas.length; i++) {
    adicionarCritica(
      dadosCriticas[i].revisao.codigoFonte,
      dadosCriticas[i].titulo
    );
    await new Promise(r => setTimeout(r, 50));
    let tamanhoAtual = Number(
      document
        .querySelector("#progressoListaDownload")
        .style.width.replace("%", "")
    );
    document.querySelector("#progressoListaDownload").style.width =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
    document.querySelector("#progressoListaDownload").innerText =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
  }

  if(dadosFontes.length != 0){
    tamanhoItem = 25 / dadosFontes.length
  }else{
    tamanhoItem = 25
    let tamanhoAtual = Number(
      document
        .querySelector("#progressoListaDownload")
        .style.width.replace("%", "")
    );
    document.querySelector("#progressoListaDownload").style.width =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
    document.querySelector("#progressoListaDownload").innerText =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
  }
  
  for (let i = 0; i < dadosFontes.length; i++) {
    adicionarFonte(
      dadosFontes[i].revisao.codigoFonte,
      dadosFontes[i].titulo
    );
    await new Promise(r => setTimeout(r, 50));
    let tamanhoAtual = Number(
      document
        .querySelector("#progressoListaDownload")
        .style.width.replace("%", "")
    );
    document.querySelector("#progressoListaDownload").style.width =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
    document.querySelector("#progressoListaDownload").innerText =
      (tamanhoAtual + tamanhoItem).toFixed(2) + "%";
  }

  criarZip()
  document.querySelector("#progressoListaDownload").style.width = "100%";
  document.querySelector("#progressoListaDownload").innerText = "100%";
  document.querySelector("#botaoGerarArquivos").removeAttribute("disabled");
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
      let tituloArq =
        $("#formPrefixoNome").val() + " Centralizador de Utilitários";

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

      let tituloArq =
        $("#formPrefixoNome").val() + " Gerenciador de Identificadores";

      let rasc = await gerarRascunho(tituloArq);
      idRascunho = rasc.id;
      tituloRascunho = rasc.titulo;
      idEntidade = rasc.entidadeId;
      let prefixoIdentificador = $("#formPrefixoIdentificador").val();

      let ger = await gerarCodigo(
        buscarCodigoGerenciadorComponentes(arquivos, prefixoIdentificador),
        idRascunho
      );

      let pub = await publicarCodigo(idRascunho);
      idPublicacao = pub.id;

      let identificador = prefixoIdentificador + "utilitarios_identificadores";

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

function buscaCodigos(offset) {
  return $.ajax({
    url: `https://scripts.cloud.betha.com.br/scripts/v1/api/componentes?limit=100&offset=${offset}`,
    type: "GET",
    headers: {
      authorization: bearerToken,
      "user-access": userAcess
    },
    success: function(data) {
      console.log("Retornados com sucesso");
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log(xhr.responseText);
    }
  });
}
