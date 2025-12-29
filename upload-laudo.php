<?php
header('Content-Type: application/json');

date_default_timezone_set('America/Sao_Paulo');

// DEBUG:
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// FIM DEBUG


$diretorio = __DIR__ . '/Laudos/';

if (!isset($_FILES['laudo'])) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Nenhum arquivo enviado'
    ]);
    exit;
}

$arquivo = $_FILES['laudo'];

if ($arquivo['error'] !== UPLOAD_ERR_OK) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Erro no upload'
    ]);
    exit;
}

// Validação simples de PDF
if ($arquivo['type'] !== 'application/pdf') {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Arquivo não é PDF'
    ]);
    exit;
}

// Nome único (evita sobrescrever)
function limparTexto($texto) {
    $texto = mb_strtolower($texto, 'UTF-8');

    $mapa = [
        'á'=>'a','à'=>'a','ã'=>'a','â'=>'a',
        'é'=>'e','è'=>'e','ê'=>'e',
        'í'=>'i','ì'=>'i','î'=>'i',
        'ó'=>'o','ò'=>'o','õ'=>'o','ô'=>'o',
        'ú'=>'u','ù'=>'u','û'=>'u',
        'ç'=>'c'
    ];

    $texto = strtr($texto, $mapa);

    $texto = preg_replace('/[^a-z0-9]/', '_', $texto);
    $texto = preg_replace('/_+/', '_', $texto);

    return trim($texto, '_');
}

$paciente = !empty($_POST['paciente'])
    ? limparTexto($_POST['paciente'])
    : 'paciente';

$setor = !empty($_POST['setor'])
    ? limparTexto($_POST['setor'])
    : 'setor';

$prontuario = !empty($_POST['prontuario']) && $_POST['prontuario'] !== 'semprontuario'
    ? limparTexto($_POST['prontuario'])
    : 'semprontuario';

$tipo = !empty($_POST['tipo'])
    ? limparTexto($_POST['tipo'])
    : 'exame';
  

$nomeBase = "{$tipo}_{$paciente}_{$prontuario}_{$setor}";
$dataHora = date('Y-m-d_H-i');

$modo = $_POST['modo'] ?? 'novo';

    if ($modo === 'editar') {
        // 🔁 sobrescreve o PDF existente (pré-liberação)
        if (empty($_POST['arquivo_atual'])) {
            echo json_encode([
                'sucesso' => false,
                'erro' => 'Arquivo atual não informado para edição'
            ]);
            exit;
        }

        $nomeFinal = basename($_POST['arquivo_atual']);
        $caminhoFinal = $diretorio . $nomeFinal;

    }
    elseif ($modo === 'retificar') {
        // ➕ cria novo PDF com histórico
        $contador = 0;
        $arquivos = scandir($diretorio);

        foreach ($arquivos as $arquivoExistente) {
            if (
                strpos($arquivoExistente, $nomeBase . '_retificado(') === 0 &&
                preg_match('/_retificado\((\d+)\)/', $arquivoExistente, $match)
            ) {
                $contador = max($contador, (int)$match[1]);
            }
        }

        $contador++;
        $nomeFinal = "{$nomeBase}_retificado({$contador})_{$dataHora}.pdf";
        $caminhoFinal = $diretorio . $nomeFinal;

    }
    else {
        // 📄 primeiro laudo
        $nomeFinal = "{$nomeBase}_{$dataHora}.pdf";
        $caminhoFinal = $diretorio . $nomeFinal;
    }

if (!move_uploaded_file($arquivo['tmp_name'], $caminhoFinal)) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Falha ao salvar arquivo'
    ]);
    exit;
}

echo json_encode([
    'sucesso' => true,
    'arquivo' => $nomeFinal
]);
