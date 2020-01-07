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

function mostrarGerenciadorComponentes() {
  document.querySelector("#individual").style.display = "none";
  document.querySelector("#listaArquivos").style.display = "block";
  document.querySelector("#progressoLista").style.display = "none";
  document.querySelector("#botaoLog").style.display = "inline";
}

function mostrarPrincipal() {
  document.querySelector("#principal").style.display = "block";
  document.querySelector("#configuracao").style.display = "none";
  document.querySelector("#exportacoes").style.display = "none";
}

function mostrarExportacoes() {
  document.querySelector("#principal").style.display = "none";
  document.querySelector("#configuracao").style.display = "none";
  document.querySelector("#exportacoes").style.display = "block";
}

function mostrarConfiguracoes() {
  document.querySelector("#principal").style.display = "none";
  document.querySelector("#exportacoes").style.display = "none";
  document.querySelector("#configuracao").style.display = "block";
}

function mostrarLogs() {
  document.querySelector("#modalLog").style.display = "block";
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
    mostrarGerenciadorComponentes();
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

function escondeModal(id) {
  document.querySelector("#" + id).style.display = "none";
}
