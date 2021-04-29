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
      		$file_content = file_get_contents("uploads/".$file_name);
      		if( strpos($file_content,"mass")<1 ){add_header("uploads/".$file_name,"mass tag");}
         	return true;
      	}else{
         	print_r($errors);
         	return false;
      	}
    }
?>
<!DOCTYPE html>
<html>
<head>
	<script src="https://d3js.org/d3.v6.min.js"></script>
	<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
	<title>File uploader</title>
</head>
<body>
	<h1>File uploader</h1>
	<p>Upload data file</p>
	<div>
		<form method="post" enctype="multipart/form-data">
			<input type="file" name="datafile" id="input">
			<input type="submit" value="upload">
		</form>
	<div style="color:red;">
	<?php
		$control = false;
		if(isset($_FILES['datafile'])){$control = handle_upload($_FILES["datafile"]);}
		if($control===false){exit("Upload a data file!");}
	?>
	</div>
	</div>
	<div id="plot">
	<script type="text/javascript">
		let data_e=[], data_m=[], data_4ee=[],  data_4me=[], data_4mm=[], data_g=[];
		let filename = "<?php echo "uploads/".$_FILES["datafile"]["name"]; ?>";
		console.log(filename);
  		d3.dsv(" ", filename,function(events){	
  			switch(events.tag){
  				case("e"):
  					data_e.push(parseFloat(events.mass));
  					break;
  				case("m"):
  					data_m.push(parseFloat(events.mass));
  					break;
  				case("4ee"):
  					data_4ee.push(parseFloat(events.mass));
  					break;
  				case("4mm"):
  					data_4mm.push(parseFloat(events.mass));
  					break;
  				case("4me"):
  					data_4me.push(parseFloat(events.mass));
  					break;
  				case("g"):
  					data_g.push(parseFloat(events.mass));
  					break;
  			}
  			return data_e, data_m, data_4ee, data_4me, data_4mm, data_g;
  		})
  		setTimeout( () => {	
    		let trace_e = {
  				x: data_e,
  				type:"histogram",
  				name: "e"
  			};
  			
  			let trace_m = {
  				x: data_m,
  				type:"histogram",
  				name: "m"
  			};
  			
  			let trace_4ee = {
  				x: data_4ee,
  				type:"histogram",
  				name: "4ee"
  			};
  			let trace_4mm = {
  				x: data_4mm,
  				type:"histogram",
  				name: "4mm"
  			};
  			let trace_4me = {
  				x: data_4me,
  				type:"histogram",
  				name: "4me"
  			};
  			let trace_g = {
  				x: data_g,
  				type:"histogram",
  				name: "g"
  			};
  			let layout = {
  				barmode:"stack",
  				yaxis:{type:'log'}
  			};
  			Plotly.newPlot("plot",[trace_g, trace_4me, trace_4mm, trace_4ee, trace_m, trace_e],layout);
		}, 200);
	</script>
	</div>
</body>
</html>