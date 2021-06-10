<?php
function add_header($filename,$header){
    $old_content = file_get_contents($filename);
    $handle = fopen($filename,'w+');
    if(fwrite($handle, $header."\n".$old_content)===false){fclose($handle); return false;}
    else{fclose($handle); return true;}
  }

function handle_upload($file){
      $errors= array();
        $file_name = $file['name'];
        $file_size =$file['size'];
        $file_tmp =$file['tmp_name'];
        $file_type=$file['type'];
        $tmp = explode('.',$file['name']);
        $file_ext=strtolower(end($tmp));
      
        $extensions= array("txt","dat","csv");
      
        if(in_array($file_ext,$extensions)=== false){
          $errors[]="extension not allowed, please choose a JPEG or PNG file.";
        }

        if($file_size > 2097152){
          $errors[]='File size must not exceed 2 MB';
        }
      
        if(empty($errors)==true){
          move_uploaded_file($file_tmp,"uploads/".htmlentities($file_name));
          echo "Success";

          // Adding header
          //$file_content = file_get_contents("uploads/".$file_name);
          //if( strpos($file_content,"tag")<1 ){add_header("uploads/".$file_name,"tag mll pt1 eta1 pt2 eta2 pt3 eta3 pt4 eta4 met");}
          return true;
        }else{
          print_r($errors);
          return false;
        }
    }
?>