<?php

require 'fpdf/fpdf.php';

const TEMPIMGLOC = 'tempimg.png';

$dataURI    = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAMAAADarb8dAAAABlBMVEUAAADtHCTeKUOwAAAAF0lEQVR4AWOgAWBE4zISkMbDZQRyaQkABl4ADHmgWUYAAAAASUVORK5CYII=";
$dataPieces = explode(',',$dataURI);
$encodedImg = $dataPieces[1];
$decodedImg = base64_decode($encodedImg);

//  Check if image was properly decoded
if( $decodedImg!==false )
{
    //  Save image to a temporary location
    if( file_put_contents(TEMPIMGLOC,$decodedImg)!==false )
    {
        //  Open new PDF document and print image
        $pdf = new FPDF();
        $pdf->AddPage();
        $pdf->Image(TEMPIMGLOC);
        $pdf->Output();

        //  Delete image from server
        unlink(TEMPIMGLOC);
    }
}

?>