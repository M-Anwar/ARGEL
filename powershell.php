<?php
$psPath = 'c:\\Windows\\System32\WindowsPowerShell\v1.0\\powershell.exe';
$psDIR = "c:\\wamp\\www\\printer\\scripts\\";
$psScript = "rabbit.ps1";
$runCMD = $psPath. ' -ExecutionPolicy RemoteSigned '.$psDIR.$psScript;

exec($psPath, $out);
echo join($out);
?>