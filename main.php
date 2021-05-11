<?php	require 'uploader.php' ?>
<!DOCTYPE html>
<html>
<head>
    <title>Histograms</title>
    <link type="text/css" rel="stylesheet" href="style.css">
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.1.2/papaparse.min.js"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/crossfilter/1.3.12/crossfilter.min.js"></script>
    <script language="JavaScript" type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.js"></script>
</head>
<body>

  <div class="upload">
    <h1>File uploader</h1>
    <p>Upload data file</p>
  </div>

	<div class="upload">
		<form method="post" enctype="multipart/form-data">
			<input type="file" name="datafile" id="input">
			<input type="submit" value="upload">
		</form>
  </div>
	<div class="error upload">
	  <?php
		    $control = false;
		    if(isset($_FILES['datafile']['name'])){$control = handle_upload($_FILES["datafile"]);}
		    if($control===false){exit("Upload a data file!");}
	  ?>
	</div>

  <script type="text/javascript">
    const filename = '<?php echo "uploads/".($_FILES["datafile"]["name"]); ?>';
    console.log(filename);
  </script>
  <script type="text/javascript" src="plotter.js"></script>

  <div class="loader">
    <div class="loader-wrapper">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>

  <script>
    $(window).on("load",function(){
      $(".loader").fadeOut(100, "linear");
    });
  </script>

  <div class="wrapper">
   	<div id="hist_mass"></div>
   	<div id="hist_v1"></div>
   	<div id="hist_v2"></div>
   	<div id="hist_v3"></div>
   	<div id="hist_v4"></div>
   	<div id="hist_v5"></div>
   	<div id="hist_v6"></div>
  </div>
</body>
</html>

