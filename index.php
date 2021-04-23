<!DOCTYPE html>
<meta charset="utf-8">
<style> /* set the CSS */

	rect.bar { fill: steelblue; }

</style>
<body>
	<!DOCTYPE html>
	<meta charset="utf-8">
	<style>

	body {
	  font: 10px sans-serif;
	}

	.bar rect {
	  shape-rendering: crispEdges;
	}

	.bar text {
	  fill: #999999;
	}

	.axis path, .axis line {
	  fill: none;
	  stroke: #000;
	  shape-rendering: crispEdges;
	}

	</style>
	<!-- The data encoding type, enctype, MUST be specified as below -->
	<form enctype="multipart/form-data" action="index.php" method="POST">
    	<!-- MAX_FILE_SIZE must precede the file input field -->
    	<input type="hidden" name="MAX_FILE_SIZE" value="30000" />
    	<!-- Name of input element determines name in $_FILES array -->
    	Send this file: <input name="userfile" type="file" />
    	<input type="submit" value="Send File" />
	</form>
	<body>
		<?php
			$target_dir = "uploads/";
			$target_file = $target_dir.$_FILES["userfile"]["name"];
			echo $target_file;
			var_dump(move_uploaded_file($_FILES["userfile"]["name"], $target_file));
			//echo "Uploaded \n";
			//move_uploaded_file($filename, getcwd()); //need security check HERE
			//$filename = getcwd()."/".$filename;
			// Adding header 
			//$filecontent = file_get_contents($filename);
			//if(strpos($filecontent,"mass")==FALSE){file_put_contents($filename, "mass tag\n".$filecontent);}
			//echo file_get_contents($filename);
		?>
		<p>Plotting histogram for </p>
	</body>
	<script type="text/javascript">
		let filename = "testdata_head.dat";//"<?php echo $target_file ?>";
		//console.log(filename);
	</script>
	<script src="https://d3js.org/d3.v6.min.js"></script>
	<div id="my_dataviz">
		<script src="hist.js"></script>
	</div>
