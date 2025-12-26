<?php
header('Content-Type: application/json');

date_default_timezone_set('America/Sao_Paulo');

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
  

$dataHora = date('Y-m-d_H-i');

$nomeFinal = "{$tipo}_{$paciente}_{$prontuario}_{$setor}_{$dataHora}.pdf";

$caminhoFinal = $diretorio . $nomeFinal;

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
