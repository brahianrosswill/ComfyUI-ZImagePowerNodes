<div align="center">

# ComfyUI-ZImageNodes

<!--

[<img src="https://img.shields.io/badge/CivitAI%3A-ZImageNodes-EEE?labelColor=1971C2&logo=c%2B%2B&logoColor=white" height="22">](https://civitai.com/models/1213728) |
[<img src="https://img.shields.io/badge/Hugging%20Face%3A-ZImageNodes-EEE?labelColor=FFD21E&logo=huggingface&logoColor=000" height="22">](https://huggingface.co/martin-rizzo/ZImageNodes.prototype1)  
[![Platform](https://img.shields.io/badge/platform%3A-ComfyUI-007BFF)](#)
[![License](https://img.shields.io/github/license/martin-rizzo/ComfyUI-ZImageNodes?label=license%3A&color=28A745)](#)
[![Version](https://img.shields.io/github/v/tag/martin-rizzo/ComfyUI-ZImageNodes?label=version%3A&color=D07250)](#)
[![Last](https://img.shields.io/github/last-commit/martin-rizzo/ComfyUI-ZImageNodes?label=last%20commit%3A)](#)  

-->

<!-- Main Image 
![Z-Image Nodes](./docs/img/zimage-nodes-workflow.jpg)
-->

</div>

**ComfyUI-ZImageNodes** is a collection of custom nodes diseñados específicamente para el modelo Z-Image. Están basados en algunas ideas y descubrimientos que hice minetras desarrollaba los workflows de AmazingZImageWorkflow.

## Table of Contents
1. [Node Installation](#node-installation)
   - [Installation via ComfyUI Manager (Recommended)](#installation-via-comfyui-manager-recommended)
   - [Manual Installation](#manual-installation)
   - [Windows Portable Installation](#windows-portable-installation)
2. [License](#license)


## Node Installation
_Ensure you have the latest version of [ComfyUi](https://github.com/comfyanonymous/ComfyUI)._

### Installation via ComfyUI Manager (Recommended)

The easiest way to install the nodes is through ComfyUI Manager:

  1. Open ComfyUI and click on the "Manager" button to launch the "ComfyUI Manager Menu".
  2. Within the ComfyUI Manager, locate and click on the "Custom Nodes Manager" button.
  3. In the search bar, type "Z-Image Nodes".
  4. Select the "ComfyUI-ZImageNodes" node from the search results and click the "Install" button.
  5. Restart ComfyUI to ensure the changes take effect.

### Manual Installation

<details>
<summary>🛠️ Manual installation instructions. (expand for details)</summary>
.

1. Open your preferred terminal application.
2. Navigate to your ComfyUI directory:
   ```bash
   cd <your_comfyui_directory>
   ```
3. Move into the **custom_nodes** folder and clone the repository:
   ```bash
   cd custom_nodes
   git clone https://github.com/martin-rizzo/ComfyUI-ZImageNodes
   ```
</details>

### Windows Portable Installation

<details>
<summary>🛠️ Windows portable installation instructions. (expand for details)</summary>
.

1. Go to where you unpacked **ComfyUI_windows_portable**,  
   you'll find your `run_nvidia_gpu.bat` file here, confirming the correct location.
3. Press **CTRL + SHIFT + RightClick** in an empty space and select "Open PowerShell window here".
4. Clone the repository into your custom nodes folder using:
   ```
   git clone https://github.com/martin-rizzo/ComfyUI-ZImageNodes .\ComfyUI\custom_nodes\ComfyUI-ZImageNodes
   ```
</details>


## Example Workflow

<!--
<table>
  <tr>
    <td width="190px">
      <img src="workflows/ximg/zimage-nodes-workflow.png" alt="Z-Image Nodes Workflow" width="171" height="256">
    </td>
    <td>
      The image contains a reference workflow for using and testing the Z-Image model with these nodes.<br/>
      <i>- to load this workflow, simply drag and drop the image into ComfyUI.</i><br/>
      <i>- other workflows are available in the <b><a href="workflows">workflows directory</a></b>.</i> 
    </td>
  </tr>
</table>
-->

## License

Copyright (c) 2026 Martin Rizzo  
This project is licensed under the MIT license.  
See the ["LICENSE"](LICENSE) file for details.
  
