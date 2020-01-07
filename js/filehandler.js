var zip = undefined

function adicionarComponente(texto, titulo) {
  if(zip === undefined){
    zip = new JSZip();
  }

  zip.folder("componentes").file(titulo.concat(".groovy"), texto);
}

function adicionarScript(texto, titulo) {
  if(zip === undefined){
    zip = new JSZip();
  }

  zip.folder("scripts").file(titulo.concat(".groovy"), texto);
}

function adicionarCritica(texto, titulo) {
  if(zip === undefined){
    zip = new JSZip();
  }

  zip.folder("criticas").file(titulo.concat(".groovy"), texto);
}

function adicionarFonte(texto, titulo) {
  if(zip === undefined){
    zip = new JSZip();
  }

  zip.folder("fontes-dinamicas").file(titulo.concat(".groovy"), texto);
}

function criarZip(listaArquivos) {
  var promise = null;
  if (JSZip.support.uint8array) {
    promise = zip.generateAsync({ type: "uint8array" });
  } else {
    promise = zip.generateAsync({ type: "string" });
  }

  zip.generateAsync({ type: "blob" }).then(function(promise) {
    saveAs(promise, "projeto_exportado.zip");
  });
}
