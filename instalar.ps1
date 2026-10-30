# Marco Arte - instalador para Windows
# Uso (en PowerShell):  irm https://raw.githubusercontent.com/diegovvo-dev/marco-arte-tv/main/instalar.ps1 | iex
#
# Hace todo en orden:
#  1. Descarga la herramienta oficial de Google para hablar con el Fire TV (solo la primera vez).
#  2. Descarga la version mas nueva de la app desde GitHub.
#  3. Sharp (Marco Arte): instala, copia tus fotos de marco-arte\fotos y conecta Spotify la primera vez.
#  4. Tele vertical (centro de control): instala y le pasa tu configuracion (calendario, Madrid, aparatos).
#  5. Deja programado que la laptop mande su bateria al centro cada 5 minutos.
#  6. Abre la app en las teles.
# Nada de esto sube tus fotos ni tus datos a internet: todo va directo por el Wi-Fi de la casa.

$ProgressPreference = 'SilentlyContinue'
$carpeta = Join-Path $env:USERPROFILE 'marco-arte'
New-Item -ItemType Directory -Force $carpeta, (Join-Path $carpeta 'fotos') | Out-Null
Set-Location $carpeta

$paquete = 'dev.diegovvo.marcoarte'
$destino = "/sdcard/Android/data/$paquete/files"
$utf8 = New-Object Text.UTF8Encoding($false)

function Paso($texto) { Write-Host ''; Write-Host "== $texto" -ForegroundColor Cyan }
function LeerTexto($nombre) { $f = Join-Path $carpeta $nombre; if (Test-Path $f) { return (Get-Content $f -Raw).Trim() } return '' }
function GuardarTexto($nombre, $valor) { [IO.File]::WriteAllText((Join-Path $carpeta $nombre), $valor, $utf8) }

# ---------- Direcciones de las teles
$ip = LeerTexto 'ip-tele.txt'
if (-not $ip) {
    $ip = (Read-Host 'IP del Fire TV de la Sharp (Configuracion > Mi Fire TV > Informacion > Red)').Trim()
    GuardarTexto 'ip-tele.txt' $ip
}
$ipCentro = LeerTexto 'ip-centro.txt'
if (-not $ipCentro) {
    $ipCentro = (Read-Host 'IP del Fire TV de la tele vertical (centro de control). Si todavia no esta conectado, deja vacio y presiona Enter').Trim()
    if (-not $ipCentro) { $ipCentro = 'no' }
    GuardarTexto 'ip-centro.txt' $ipCentro
}
$hayCentro = $ipCentro -and $ipCentro -ne 'no'

# ---------- Tu configuracion (se pregunta una sola vez; queda en marco-arte\config-usuario.json)
$archivoUsuario = Join-Path $carpeta 'config-usuario.json'
$usuario = if (Test-Path $archivoUsuario) { Get-Content $archivoUsuario -Raw | ConvertFrom-Json } else { New-Object PSObject }
if ($hayCentro) {
    if (-not ($usuario.PSObject.Properties.Name -contains 'calendario') -and -not ($usuario.PSObject.Properties.Name -contains 'calendarios')) {
        $cal = (Read-Host 'Link publico de tu calendario de iCloud (webcal://...). Deja vacio si aun no lo tienes').Trim()
        $usuario | Add-Member -NotePropertyName calendario -NotePropertyValue $cal -Force
    }
    if (-not ($usuario.PSObject.Properties.Name -contains 'madrid')) {
        $f = (Read-Host 'Fecha de tu viaje a Madrid (dia/mes/ano, ej. 11/01/2027). Deja vacio si aun no sabes').Trim()
        $iso = ''
        if ($f -match '^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$') { $iso = '{0}-{1:D2}-{2:D2}' -f $Matches[3], [int]$Matches[2], [int]$Matches[1] }
        $usuario | Add-Member -NotePropertyName madrid -NotePropertyValue $iso -Force
    }
    [IO.File]::WriteAllText($archivoUsuario, ($usuario | ConvertTo-Json -Depth 5), $utf8)
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

function Conectar($dir, $nombre) {
    Paso "Conectando con $nombre ($dir)"
    & $adb connect "${dir}:5555" | Out-Null
    $estado = (& $adb -s "${dir}:5555" get-state 2>$null)
    if ($estado -ne 'device') {
        Write-Host "Si en la tele aparece 'Permitir depuracion', marca 'Siempre permitir' y dale OK." -ForegroundColor Yellow
        Read-Host 'Luego presiona Enter aqui'
        & $adb connect "${dir}:5555" | Out-Null
        $estado = (& $adb -s "${dir}:5555" get-state 2>$null)
    }
    if ($estado -ne 'device') { Write-Host "No pude conectar con $nombre. Revisa que este prendida y con Depuracion ADB activada." -ForegroundColor Red; return $null }
    return "${dir}:5555"
}

function Instalar($tele, $modo, $config) {
    Paso 'Instalando la app'
    & $adb -s $tele install -r 'marco-arte-tv.apk'
    # Permiso para que la app se abra sola al prender la tele
    & $adb -s $tele shell appops set $paquete SYSTEM_ALERT_WINDOW allow | Out-Null
    & $adb -s $tele shell cmd deviceidle whitelist +$paquete | Out-Null
    $tmp = Join-Path $carpeta "tmp-$modo"
    New-Item -ItemType Directory -Force $tmp | Out-Null
    [IO.File]::WriteAllText((Join-Path $tmp 'modo.txt'), $modo, $utf8)
    [IO.File]::WriteAllText((Join-Path $tmp 'config.json'), ($config | ConvertTo-Json -Depth 6 -Compress), $utf8)
    & $adb -s $tele shell "mkdir -p '$destino'" | Out-Null
    & $adb -s $tele push (Join-Path $tmp 'modo.txt') "$destino/modo.txt" | Out-Null
    & $adb -s $tele push (Join-Path $tmp 'config.json') "$destino/config.json" | Out-Null
}

# ---------- Sharp: Marco Arte
$sharp = Conectar $ip 'la Sharp (Marco Arte)'
if ($sharp) {
    $cfgSharp = @{ centroIp = $(if ($hayCentro) { $ipCentro } else { '' }) }
    Instalar $sharp 'arte' $cfgSharp

    Paso 'Copiando tus fotos a la Sharp'
    & $adb -s $sharp shell "rm -rf '$destino/fotos'; mkdir -p '$destino/fotos'"
    $fotos = Get-ChildItem (Join-Path $carpeta 'fotos') -File | Where-Object { $_.Extension -match '^\.(jpe?g|png|webp)$' }
    foreach ($f in $fotos) {
        & $adb -s $sharp push $f.FullName "$destino/fotos/$($f.Name)" | Out-Null
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
        & $adb -s $sharp push $archivoSpotify "$destino/spotify.json" | Out-Null
    }
}

# ---------- Tele vertical: centro de control
if ($hayCentro) {
    $centro = Conectar $ipCentro 'la tele vertical (centro de control)'
    if ($centro) {
        $aparatos = @(@{ nombre = 'Marco Arte'; icono = 'tele'; ip = $ip })
        if ($usuario.PSObject.Properties.Name -contains 'aparatos') { $aparatos += @($usuario.aparatos) }
        $cfgCentro = @{
            calendario  = "$($usuario.calendario)"
            calendarios = @($usuario.calendarios)
            madrid      = "$($usuario.madrid)"
            clases      = "$($usuario.clases)"
            cuartoSonos = 'Diego'
            aparatos    = $aparatos
        }
        Instalar $centro 'centro' $cfgCentro

        # La laptop manda su bateria al centro cada 5 minutos (sin ventanas)
        Paso 'Programando el envio de la bateria de la laptop'
        $scriptLaptop = @'
$c = Join-Path $env:USERPROFILE 'marco-arte'
$ip = (Get-Content (Join-Path $c 'ip-centro.txt') -Raw).Trim()
if (-not $ip -or $ip -eq 'no') { exit }
$b = Get-CimInstance Win32_Battery | Select-Object -First 1
$st = [int]$b.BatteryStatus
$datos = @{ bateria = [int]$b.EstimatedChargeRemaining; cargando = ($st -eq 2 -or $st -ge 6); enviado = (Get-Date).ToString('o') } | ConvertTo-Json -Compress
try { Invoke-RestMethod -Uri "http://${ip}:8765/laptop" -Method Post -Body $datos -ContentType 'application/json' -TimeoutSec 5 | Out-Null } catch { }
# Resumen de Claude: una tarea programada de Claude lo deja en marco-arte\claude.json
$cl = Join-Path $c 'claude.json'
if (Test-Path $cl) {
  $txt = [IO.File]::ReadAllText($cl)
  try { Invoke-RestMethod -Uri "http://${ip}:8765/claude" -Method Post -Body ([Text.Encoding]::UTF8.GetBytes($txt)) -ContentType 'application/json; charset=utf-8' -TimeoutSec 5 | Out-Null } catch { }
}
'@
        [IO.File]::WriteAllText((Join-Path $carpeta 'laptop.ps1'), $scriptLaptop, $utf8)
        try {
            $accion = New-ScheduledTaskAction -Execute 'conhost.exe' -Argument ('--headless powershell.exe -NoProfile -ExecutionPolicy Bypass -File "' + (Join-Path $carpeta 'laptop.ps1') + '"')
            $cuando = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 3650)
            $reglas = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
            Register-ScheduledTask -TaskName 'Marco Arte - laptop' -Action $accion -Trigger $cuando -Settings $reglas -Force | Out-Null
            & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $carpeta 'laptop.ps1')
            Write-Host '  Listo: la laptop avisa su bateria cada 5 minutos.'
        } catch {
            Write-Host "  No se pudo programar la tarea de la laptop: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# ---------- Abrir
Paso 'Abriendo Marco Arte'
foreach ($t in @($sharp, $centro)) {
    if ($t) {
        & $adb -s $t shell am force-stop $paquete
        & $adb -s $t shell monkey -p $paquete -c android.intent.category.LAUNCHER 1 | Out-Null
    }
}
Write-Host ''
Write-Host 'Listo.' -ForegroundColor Green
if ($hayCentro) { Write-Host "Buzon del centro para el Atajo del iPhone: http://${ipCentro}:8765/iphone" -ForegroundColor Green }
