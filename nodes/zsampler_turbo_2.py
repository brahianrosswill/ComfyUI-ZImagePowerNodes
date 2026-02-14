"""
File    : zsampler_turbo_2.py
Purpose : Node for denoising latent images using a set of custom sigmas with Z-Image Turbo (ZIT)
Author  : Martin Rizzo | <martinrizzo@gmail.com>
Date    : Feb 14, 2026
Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
License : MIT
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                          ComfyUI-ZImagePowerNodes
         ComfyUI nodes designed specifically for the "Z-Image" model.
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

  ComfyUI V3 schema documentation can be found here:
  - https://docs.comfy.org/custom-nodes/v3_migration

_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
"""
from typing                     import Any
from comfy_api.latest           import io
from .zsampler_turbo_advanced_2 import ZSamplerTurboAdvanced2


class ZSamplerTurbo2(io.ComfyNode):
    xTITLE         = "Z-Sampler Turbo"
    xCATEGORY      = ""
    xCOMFY_NODE_ID = ""
    xDEPRECATED    = False

    #__ INPUT / OUTPUT ____________________________________
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            display_name  = cls.xTITLE,
            category      = cls.xCATEGORY,
            node_id       = cls.xCOMFY_NODE_ID,
            is_deprecated = cls.xDEPRECATED,
            description   = (
                'Efficiently denoises the latent image, specifically tuned for the "Z-Image Turbo" model. '
                'This node takes a Z-Image Turbo model, an initial latent image, and conditioning parameters, '
                'and produces a denoised output ready for further processing or decoding.'
            ),
            inputs=[
                io.Model.Input       ("model",
                                      tooltip="The model used for generating the latent images.",
                                     ),
                io.Conditioning.Input("positive",
                                      tooltip="The conditioning used to guide the generation process toward the desired content.",
                                     ),
                io.Latent.Input      ("latent_input",
                                      tooltip="The initial latent image to be modified; typically an 'Empty Latent' for text-to-image or an encoded image for img2img.",
                                     ),
                io.Int.Input         ("seed", default=0, min=0, max=0xffffffffffffffff, control_after_generate=True,
                                      tooltip="The seed used for the random noise generator, ensuring the same result is produced with the same value.",
                                     ),
                io.Int.Input         ("steps", default=9, min=4, max=9, step=1,
                                      tooltip="The number of iterations to be performed during the sampling process.",
                                     ),
                io.Combo.Input       ("noise_bias_method", default="experimental", options=["experimental", "accurate", "ignore"],
                                      tooltip="Method used to calculate the bias in each channel of the initial noise. "
                                      "`experimental`: Denoises a blank latent image to calculate the bias. "
                                      "`accurate`: Denoises a random latent image to calculate the bias. "
                                      "`ignore`: Use a zero-biased initial noise. (old method)",
                                     ),
                io.Float.Input       ("denoise", default=1.0, min=0.98, max=1.00, step=0.01,
                                      tooltip="The amount of denoising applied, lower values will maintain the structure of the initial image allowing for image to image sampling.",
                                     ),
            ],
            outputs=[
                io.Latent.Output(display_name="latent_output", tooltip="The resulting denoised latent image, ready to be decoded by a VAE or passed to another sampler."),
            ]
        )

    #__ FUNCTION __________________________________________
    @classmethod
    def execute(cls,
                model,
                positive         : list,
                latent_input     : dict[str, Any],
                seed             : int,
                steps            : int,
                noise_bias_method: str,
                denoise          : float,
                ) -> io.NodeOutput:

        if noise_bias_method == "experimental":
            return ZSamplerTurboAdvanced2.execute(
                model               = model,
                positive            = positive,
                latent_input        = latent_input,
                seed                = seed,
                steps               = steps,
                noise_offset_method = "experimental",
                noise_offset_scale  = 0.11,
                noise_overdose      = 0.34,
                denoise             = denoise)


        elif noise_bias_method == "accurate":
            return ZSamplerTurboAdvanced2.execute(
                model               = model,
                positive            = positive,
                latent_input        = latent_input,
                seed                = seed,
                steps               = steps,
                noise_offset_method = "accurate",
                noise_offset_scale  = 0.06,
                noise_overdose      = 0.34,
                denoise             = denoise)

        elif noise_bias_method == "ignore":
            return ZSamplerTurboAdvanced2.execute(
                model               = model,
                positive            = positive,
                latent_input        = latent_input,
                seed                = seed,
                steps               = steps,
                noise_offset_method = "experimental",
                noise_offset_scale  = 0.0,
                noise_overdose      = 0.0,
                denoise             = denoise)

        else:
            raise Exception(f"Unknown noise bias method: {noise_bias_method}")

