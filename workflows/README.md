
# Z-Image Power Nodes: Example Workflows

__Folders__
 * `/BF16`: Contains workflows pre-configured for .safetensors BF16 checkpoints.
 * `/FP8` : Contains workflows pre-configured for .safetensors FP8 checkpoints.
 * `/GGUF`: Contains workflows pre-configured for GGUF format checkpoints.

__Workflows__
 * `z-image-turbo__inpainting.json`: Main reference workflow for inpainting tasks using power nodes.
 * `z-image-turbo__t2i_double_trouble.json`: Text-to-image workflow combining two different styles.
 * `z-image-turbo__text2image.json` : Main reference text-to-image generation workflow.

## Requirements

To utilize any of these workflows, you need to have ComfyUI configured and the
"Z-Image Power Nodes" installed. Additionally, ensure that the required checkpoints
(in GGUF or Safetensors format) are placed in the appropriate directories within
your ComfyUI setup.

If you choose to use GGUF-format checkpoints, it is necessary to install the
"ComfyUI-GGUF" nodes as well, since ComfyUI does not natively support GGUF files.
You can find information about these nodes at: https://github.com/city96/ComfyUI-GGUF

Below in this readme, you will find detailed instructions on how to install the
necessary nodes and checkpoints.

Please note that while my work with "Z-Image Power Nodes" was developed and
tested using the recommended checkpoints listed below, it may also work
correctly with other "Z-Image Turbo" checkpoints or when applying LoRA.
However, if custom modifications are made to the workflows or alternative
checkpoint combinations are used, I cannot guarantee 100% functionality in all
cases. It becomes your responsibility to determine the suitable configuration
for your customized setups.


## Checkpoint Files

The following list includes the pre-configured checkpoints used in the workflows.
I chose these specifically because they performed best during my testing phase.
However, given the diversity of GPUs, VRAM, and ComfyUI versions, results may
vary. Therefore, I recommend testing them all to find the one that works best
for you

### GGUF (Q8/Q5)

- "z_image_turbo-Q5_K_S.gguf" |5.19 GB|
  [ Download ]( https://huggingface.co/jayn7/Z-Image-Turbo-GGUF/blob/main/z_image_turbo-Q5_K_S.gguf )  
  Local Directory: `ComfyUI/models/diffusion_models/`

- "Qwen3-4B-Q8_0.gguf" |4.28 GB|
  [ Download ]( https://huggingface.co/Qwen/Qwen3-4B-GGUF/blob/main/Qwen3-4B-Q8_0.gguf )  
  Local Directory: `ComfyUI/models/text_encoders/`


- "ae.safetensors" |335 MB|
  [ Download ]( https://huggingface.co/Comfy-Org/z_image_turbo/blob/main/split_files/vae/ae.safetensors )  
  Local Directory: `ComfyUI/models/vae/`


### Safetensors (FP8)

- "z-image-turbo_fp8_scaled_e4m3fn_KJ.safetensors" |6.16 GB|
  [ Download ]( https://huggingface.co/Kijai/Z-Image_comfy_fp8_scaled/blob/main/z-image-turbo_fp8_scaled_e4m3fn_KJ.safetensors )  
  Local Directory: `ComfyUI/models/diffusion_models/`

- "qwen3_4b_fp8_scaled.safetensors" |4.41 GB|
  [ Download ]( https://huggingface.co/hhsebsb/qwen3-4b-fp8-scaled/blob/main/qwen3_4b_fp8_scaled.safetensors )  
  Local Directory: `ComfyUI/models/text_encoders/`

- "ae.safetensors" |335 MB|
  [ Download ]( https://huggingface.co/Comfy-Org/z_image_turbo/blob/main/split_files/vae/ae.safetensors )  
  Local Directory: `ComfyUI/models/vae/`


### Safetensors (BF16)

- "z_image_turbo_bf16.safetensors" |12.3 GB|
  [ Download ]( https://huggingface.co/Comfy-Org/z_image_turbo/blob/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors )  
  Local Directory: `ComfyUI/models/diffusion_models/`


- "qwen_3_4b.safetensors" |8.04 GB|
  [ Download ]( https://huggingface.co/Comfy-Org/z_image_turbo/blob/main/split_files/text_encoders/qwen_3_4b.safetensors )  
  Local Directory: `ComfyUI/models/text_encoders/`

- "ae.safetensors" |335 MB|
  [ Download ]( https://huggingface.co/Comfy-Org/z_image_turbo/blob/main/split_files/vae/ae.safetensors )  
  Local Directory: `ComfyUI/models/vae/`



## Z-Image Power Nodes

Z-Image Power Nodes can be installed via the ComfyUI Manager or downloaded from its respective repository.

__Installation via ComfyUI Manager (Recommended):__

 - Open ComfyUI and click on the "Manager" button to launch the "ComfyUI Manager Menu".
 - Within the ComfyUI Manager, locate and click on the "Custom Nodes Manager" button.
 - In the search bar, type "Z-Image Power Nodes".
 - Select the option from the search results and click the "Install" button.
 - Restart ComfyUI to ensure the changes take effect.

__Manual Installation:__

 For manual installation, follow the instructions provided in the GitHub repository of the project:
 - https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes


