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
  
var codigo = template.replace('NOMEDOARQUIVOTEMPLATE',nomeArquivo)

  navigator.clipboard.writeText(codigo).then(
    function() {
      console.log("Async: Copiado com sucesso para o Clipboard!");
    },
    function(err) {
      console.error("Async: Erro ao copiar: ", err);
    }
  );
}

function gerarNome(){
    let nomeConfig = $("#formPrefixoNome").val();
    var titulo = nomeConfig + $("#formNomeArquivo").val()

    navigator.clipboard.writeText(titulo).toUpperCase().then(
        function() {
          console.log("Async: Copiado com sucesso para o Clipboard!");
        },
        function(err) {
          console.error("Async: Erro ao copiar: ", err);
        }
      );
}


function gerarIdentificador(){
    let prefixoIdentificador = $("#formPrefixoIdentificador").val();
    var titulo = $("#formNomeArquivo").val()
    for(var i = 0; i < 15; i++){
        titulo = titulo.replace(" ","_")
    }
    navigator.clipboard.writeText(prefixoIdentificador + titulo.toLowerCase()).then(
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
