<?php 

// Copy and paste the results from `passgen` here
$salt = '';
$pass = '';
// End copy and paste


// Defaults
$projectName = ''; // Your project name
$email		 = ''; // Email address you want pull notifcations to go to
$from        = 'no-reply'; // Who the email, when called, is sent "from"


// Get varibles from query string
if ( isset($_GET['project']) && $_GET['project'] ) $projectName = $_GET['project'];

if ( isset($_GET['email']) && $_GET['email'] )     $email = $_GET['email'];

if ( isset($_GET['from']) && $_GET['from'] )       $from = $_GET['from'];


// Don't need to edit these lines
$remoteIP = $_SERVER['REMOTE_ADDR'];
$msg	  = 'Request came from '.$remoteIP.' - http://whois.arin.net/rest/ip/'.$remoteIP;
$headers  = 'From: '.$from.' <'.$from.'@github.com>';


if (isset($_GET['update'])) {

	// We want to update the folder with the latest from the repo

	$check = md5(crypt($_GET['update'], $salt));

	if ($pass === $check) {

		// what does the pull
		$output = shell_exec('git pull');

		if ( $output && $email ) {
			// Email to say it's successful
			mail($email, '['.$projectName.'] `git pull`', $output."\r\n".$msg, $headers);
		} elseif ( $email ) {
			// We didn't get output so an error occured
			mail($email, '['.$projectName.'] `git pull` error', 'No output'."\r\n".$msg, $headers);
		}

	} elseif ( $email ) {

		// Email to say the pull failed (due to wrong pass)
		mail($email, '['.$projectName.'] `git pull` password fail', $output."\r\n".$msg, $headers); 

	}

} elseif (isset($_GET['passgen'])) {

	// We want to generate a salt and password

	$password	= $_GET['passgen'];
	$randSalt	= (string)rand();
	$generate	= crypt($password, $randSalt);
	$genPass	= md5($generate);

	$html = '<body style="width: 70%; margin: 20px auto; text-align: center; font-family: arial; line-height: 3em">';

	$html .= '<p><label>Add the following code to <code>'.$_SERVER['SCRIPT_FILENAME'].'</code><br /><textarea cols="50" rows="2" style="padding: 10px">';
	$html .= '$salt = \''.$randSalt.'\';'."\n";
	$html .= '$pass = \''.$genPass.'\';';
	$html .= '</textarea></label></p>';

	$callURL = 'http';
	if (isset($_SERVER['HTTPS']))	$callURL .= 's';
	$callURL .= '://'.$_SERVER['SERVER_NAME'].$_SERVER['SCRIPT_NAME'].'?update='.$_GET['passgen'];

	$html .= '<p><label>Add this URL your project\'s "Post-Recieve URLs"<br /><input type="text" value="'.$callURL.'" style="width: 500px; text-align: center;" /></label></p>';

	echo $html;

} elseif ( $email ) {
	mail($email, '['.$projectName.'] `git pull` failed', $msg, $headers);
}
