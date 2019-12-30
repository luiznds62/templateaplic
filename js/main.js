function gerarTemplate() {
  let nomeArquivo = $("#formNomeArquivo").val();

  
var codigo = `final ARQUIVO = "${nomeArquivo}.xml"

def lListaValidacoes = []

def busca = { params ->
    
    def mDados = [:]
    
    def cLog = params.instanceManager.getInstance("aplic_pdc_log")
    def cUrl = params.instanceManager.getInstance("aplic_utilitarios_url_cloud");
    def cUtilitarios = params.instanceManager.getInstance("aplic_pdc_utilitarios_cloud");

    return mDados  
}

def geraArquivo = { params -> 
    
    def cLog = params.instanceManager.getInstance("aplic_pdc_log")
    def cAplicApi = params.instanceManager.getInstance("aplic_pdc_api")
    
    cLog.info("Iniciando geração do arquivo $ARQUIVO")
    cLog.info("Buscando dados...")
    
    def mDados = busca(params)
    
    cLog.info("Quantidade de Registros encontrados: \${mDados.size()}", null, mDados.size())
    cLog.aviso("Não foram encontrados dados para geração do arquivo.", null, !mDados.size())
    
    def aArquivo = cAplicApi.escreverArquivo(arquivo: ARQUIVO, 
                                            dados: mDados,
                                            validarArquivo: params.validarArquivo)

    retornar(arquivo: aArquivo, contemDados: mDados.size() > 0, listalogs: lListaValidacoes.unique()) 
}

Scripts.exportar(
    geraArquivo: geraArquivo
)`;

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
    var titulo = "[APLIC 2020] " + $("#formNomeArquivo").val()

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
    var titulo = $("#formNomeArquivo").val()
    for(var i = 0; i < 15; i++){
        titulo = titulo.replace(" ","_")
    }
    navigator.clipboard.writeText('aplic2020_' + titulo.toLowerCase()).then(
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
