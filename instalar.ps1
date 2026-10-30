# Marco Arte - instalador para Windows
# Uso (en PowerShell):  irm https://raw.githubusercontent.com/diegovvo-dev/marco-arte-tv/main/instalar.ps1 | iex
#
# Hace todo en orden:
#  1. Descarga la herramienta oficial de Google para hablar con el Fire TV (solo la primera vez).
#  2. Descarga la version mas nueva de la app desde GitHub y la instala.
#  3. Copia a la tele las fotos de la carpeta marco-arte\fotos (no se suben a internet).
#  4. La primera vez, conecta tu Spotify Premium para poder pausar y cambiar canciones.
#  5. Abre la app en la tele.

$ProgressPreference = 'SilentlyContinue'
$carpeta = Join-Path $env:USERPROFILE 'marco-arte'
New-Item -ItemType Directory -Force $carpeta, (Join-Path $carpeta 'fotos') | Out-Null
Set-Location $carpeta

$paquete = 'dev.diegovvo.marcoarte'
$destino = "/sdcard/Android/data/$paquete/files"

function Paso($texto) { Write-Host ''; Write-Host "== $texto" -ForegroundColor Cyan }

# ---------- Direccion de la tele
$archivoIp = Join-Path $carpeta 'ip-tele.txt'
if (Test-Path $archivoIp) { $ip = (Get-Content $archivoIp -Raw).Trim() }
if (-not $ip) {
    $ip = Read-Host 'Escribe la IP de tu Fire TV (Configuracion > Mi Fire TV > Informacion > Red)'
    Set-Content -Path $archivoIp -Value $ip -Encoding ASCII
}

# ---------- Herramienta ADB
$adb = Join-Path $carpeta 'platform-tools\adb.exe'
if (-not (Test-Path $adb)) {
    Paso 'Descargando la herramienta de Google (ADB)'
    Invoke-WebRequest 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip' -OutFile 'pt.zip'
    Expand-Archive 'pt.zip' -DestinationPath . -Force
}

# ---------- App
Paso 'Descargando la version mas nueva de Marco Arte'
Invoke-WebRequest 'https://github.com/diegovvo-dev/marco-arte-tv/releases/latest/download/marco-arte-tv.apk' -OutFile 'marco-arte-tv.apk'

Paso "Conectando con el Fire TV ($ip)"
& $adb connect "${ip}:5555"
$estado = (& $adb -s "${ip}:5555" get-state 2>$null)
if ($estado -ne 'device') {
    Write-Host 'Si en la tele aparece "Permitir depuracion", marca "Siempre permitir" y dale OK.' -ForegroundColor Yellow
    Read-Host 'Luego presiona Enter aqui'
    & $adb connect "${ip}:5555"
}
$tele = "${ip}:5555"

Paso 'Instalando la app'
& $adb -s $tele install -r 'marco-arte-tv.apk'

# ---------- Fotos
Paso 'Copiando tus fotos a la tele'
& $adb -s $tele shell "rm -rf '$destino/fotos'; mkdir -p '$destino/fotos'"
$fotos = Get-ChildItem (Join-Path $carpeta 'fotos') -File | Where-Object { $_.Extension -match '^\.(jpe?g|png|webp)$' }
foreach ($f in $fotos) {
    & $adb -s $tele push $f.FullName "$destino/fotos/$($f.Name)" | Out-Null
    Write-Host "  $($f.Name)"
}
Write-Host "  $($fotos.Count) fotos copiadas."

# ---------- Spotify (solo la primera vez, o si borras spotify.json)
$archivoSpotify = Join-Path $carpeta 'spotify.json'
if (-not (Test-Path $archivoSpotify)) {
    Paso 'Conectar Spotify (solo esta vez)'
    $quiere = Read-Host 'Quieres controlar Spotify desde la tele? (s/n)'
    if ($quiere -match '^[sS]') {
        $clientId = (Read-Host 'Pega el Client ID de tu app de Spotify for Developers').Trim()
        $redirect = 'http://127.0.0.1:8888/callback'

        function B64Url([byte[]]$b) { [Convert]::ToBase64String($b).TrimEnd('=').Replace('+', '-').Replace('/', '_') }
        $azar = New-Object byte[] 48
        [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($azar)
        $verificador = B64Url $azar
        $reto = B64Url ([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::ASCII.GetBytes($verificador)))
        $estadoOAuth = B64Url ($azar[0..11])
        $permisos = 'user-read-playback-state user-modify-playback-state'
        $url = 'https://accounts.spotify.com/authorize?response_type=code' +
            '&client_id=' + [uri]::EscapeDataString($clientId) +
            '&redirect_uri=' + [uri]::EscapeDataString($redirect) +
            '&scope=' + [uri]::EscapeDataString($permisos) +
            '&code_challenge_method=S256&code_challenge=' + $reto +
            '&state=' + $estadoOAuth

        $escucha = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 8888)
        $escucha.Start()
        Write-Host 'Se abrira tu navegador: inicia sesion en Spotify y dale "Aceptar".' -ForegroundColor Yellow
        Start-Process $url

        $codigo = $null; $errorSpotify = $null
        while (-not $codigo -and -not $errorSpotify) {
            $cliente = $escucha.AcceptTcpClient()
            $cliente.ReceiveTimeout = 3000
            try {
                $flujo = $cliente.GetStream()
                $lector = New-Object IO.StreamReader($flujo)
                $linea = $lector.ReadLine()
                if ($linea -match '^GET /callback\?(\S+)') {
                    $consulta = @{}
                    foreach ($par in $Matches[1].Split('&')) {
                        $kv = $par.Split('=', 2)
                        $consulta[$kv[0]] = [uri]::UnescapeDataString($kv[1])
                    }
                    if ($consulta['state'] -ne $estadoOAuth) { $errorSpotify = 'respuesta inesperada' }
                    elseif ($consulta['error']) { $errorSpotify = $consulta['error'] }
                    else { $codigo = $consulta['code'] }
                    $html = if ($codigo) { 'Listo. Ya puedes cerrar esta pestana y volver a PowerShell.' } else { "No se pudo conectar: $errorSpotify" }
                    $cuerpo = [Text.Encoding]::UTF8.GetBytes("<html><body style='font-family:sans-serif;font-size:22px;padding:40px'>$html</body></html>")
                    $cabecera = [Text.Encoding]::ASCII.GetBytes("HTTP/1.1 200 OK`r`nContent-Type: text/html; charset=utf-8`r`nContent-Length: $($cuerpo.Length)`r`nConnection: close`r`n`r`n")
                    $flujo.Write($cabecera, 0, $cabecera.Length)
                    $flujo.Write($cuerpo, 0, $cuerpo.Length)
                    $flujo.Flush()
                }
            } catch { }
            $cliente.Close()
        }
        $escucha.Stop()

        if ($codigo) {
            $token = Invoke-RestMethod -Method Post -Uri 'https://accounts.spotify.com/api/token' `
                -ContentType 'application/x-www-form-urlencoded' `
                -Body @{ grant_type = 'authorization_code'; code = $codigo; redirect_uri = $redirect; client_id = $clientId; code_verifier = $verificador }
            $json = @{ client_id = $clientId; refresh_token = $token.refresh_token } | ConvertTo-Json -Compress
            [IO.File]::WriteAllText($archivoSpotify, $json, (New-Object Text.ASCIIEncoding))
            Write-Host 'Spotify conectado.' -ForegroundColor Green
        } else {
            Write-Host "Spotify no se conecto ($errorSpotify). Puedes volver a correr el instalador para intentarlo." -ForegroundColor Yellow
        }
    }
}
if (Test-Path $archivoSpotify) {
    & $adb -s $tele push $archivoSpotify "$destino/spotify.json" | Out-Null
}

# ---------- Abrir
Paso 'Abriendo Marco Arte en la tele'
& $adb -s $tele shell am force-stop $paquete
& $adb -s $tele shell monkey -p $paquete -c android.intent.category.LAUNCHER 1 | Out-Null
Write-Host ''
Write-Host 'Listo.' -ForegroundColor Green
