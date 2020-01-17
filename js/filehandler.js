let zip = undefined;

function adicionarComponente(texto, titulo) {
  if (zip === undefined) {
    zip = new JSZip();
  }

  zip.folder("componentes").file(titulo.concat(".groovy"), texto);
}

function adicionarScript(texto, titulo) {
  if (zip === undefined) {
    zip = new JSZip();
  }

  zip.folder("scripts").file(titulo.concat(".groovy"), texto);
}

function adicionarCritica(texto, titulo) {
  if (zip === undefined) {
    zip = new JSZip();
  }

  zip.folder("criticas").file(titulo.concat(".groovy"), texto);
}

function adicionarFonte(texto, titulo) {
  if (zip === undefined) {
    zip = new JSZip();
  }

  zip.folder("fontes-dinamicas").file(titulo.concat(".groovy"), texto);
}

function criarZip(listaArquivos) {
  let promise = null;
  if (JSZip.support.uint8array) {
    promise = zip.generateAsync({ type: "uint8array" });
  } else {
    promise = zip.generateAsync({ type: "string" });
  }

  zip.generateAsync({ type: "blob" }).then(function(promise) {
    saveAs(promise, "projeto_exportado.zip");
  });
}

async function handleFileSelect(evt) {
  let files = evt.target.files;

  for (let i = 0, f; (f = files[i]); i++) {
    let reader = new FileReader();

    reader.onload = async function() {
      let nome = files[i].name.substring(0, files[i].name.length - 7);

      try {
        let tamanhoProgresso = 100 / arquivos.length;
        let rasc = await gerarRascunho(nome);

        idRascunho = rasc.id;
        tituloRascunho = rasc.titulo;
        idEntidade = rasc.entidadeId;

        let codigo = reader.result;

        let ger = await gerarCodigo(codigo, idRascunho);

        let pub = await publicarCodigo(idRascunho);
        idPublicacao = pub.id;

        toastr.success("Script gerado com sucesso!");
        let tamanhoAtual = Number(
          document
            .querySelector("#progressoListaImport")
            .style.width.replace("%", "")
        );
        document.querySelector("#progressoListaImport").style.width =
          Math.round(tamanhoAtual + tamanhoProgresso) + "%";
        document.querySelector("#progressoListaImport").innerText =
          Math.round(tamanhoAtual + tamanhoProgresso) + "%";
      } catch (error) {
        console.log(error);
      }
    };

    reader.readAsText(files[i]);
  }
  document.querySelector("#progressoListaImport").style.width = "100%";
  document.querySelector("#progressoListaImport").innerText = "100%";
}
