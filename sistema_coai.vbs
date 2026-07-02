Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

strPath = FSO.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strPath

strBatPath = chr(34) & strPath & "\INICIAR_SISTEMA.bat" & chr(34)
WshShell.Run strBatPath, 0

' Aumentamos para 7 segundos (7000 ms) para dar tempo do Node.js carregar os motores
WScript.Sleep 7000
WshShell.Run "http://localhost:3000"

Set WshShell = Nothing
Set FSO = Nothing