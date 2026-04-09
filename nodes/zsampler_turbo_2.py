"""
File    : zsampler_turbo_2.py
Purpose : Node for denoising latent images using "Z-Sampler Turbo" (second generation)
Author  : Martin Rizzo | <martinrizzo@gmail.com>
Date    : Mar 20, 2026
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
from typing                    import Any
from comfy_api.latest          import io
from .core.progress_bar        import ProgressPreview
from .core.zsampler_turbo_core import zsampler_turbo_core
def Divider(id: str):
    return io.Custom("ZIPN_DIVIDER").Input(id = id)
TURBO_CREATIVITY = {
    "off"              : (False, 0),
    "scrambled"        : (True , 0),
    "refined (1-step)" : (True , 1),
    "refined (2-steps)": (True , 2),
    "refined (3-steps)": (True , 3),
}


class ZSamplerTurbo2(io.ComfyNode):
    xTITLE         = "Z-Sampler Turbo ^g2"
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
                'Efficiently denoises the latent image using a process specifically tuned for the "Z-Image Turbo". '
                'This node takes a Z-Image Turbo model, an initial latent image, and conditioning parameters, and '
                'produces a denoised latent output ready for decoding into the final image.'
            ),
            inputs=[
                io.Latent.Input      ("latent_input",
                                      tooltip="The initial latent image to be denoised; usually an 'Empty Latent' for "
                                              "text-to-image tasks or an encoded image for image-to-image processing. ",
                                     ),
                io.Model.Input       ("model",
                                      tooltip="The Z-Image Turbo model used for denoising. ",
                                     ),
                io.Conditioning.Input("positive",
                                      tooltip="The conditioning that guide the generation process toward the desired "
                                              "content. ",
                                     ),
                io.Conditioning.Input("positive_stg2",
                                      optional=True,
                                      tooltip="This input is optional and can remain disconennect. It allows specifying "
                                              "a different conditioning for the second stage of the denoising process. ",
                                     ),
                io.Conditioning.Input("positive_stg3",
                                      optional=True,
                                      tooltip="This input is optional and can remain disconennect. It allows specifying "
                                              "a different conditioning for the third stage of the denoising process. ",
                                     ),
                io.Int.Input         ("seed",
                                      default=1, min=1, max=0xffffffffffffffff, control_after_generate=True,
                                      tooltip="The seed used for the random noise generator, ensuring the same result "
                                              "is produced with the same value. ",
                                     ),
                io.Int.Input         ("steps",
                                      default=8, min=3, max=20, step=1,
                                      tooltip="Number of iterations to perform during the sampling process. ",
                                     ),
                io.Float.Input       ("denoise",
                                      default=1.00, min=0.00, max=1.00, step=0.01,
                                      tooltip="Denoising strength; lower values preserve more of the initial image "
                                              "structure, suitable for image-to-image sampling. ",
                                     ),

                Divider("divider"),#=========================================

                io.Combo.Input       ("initial_sample_size",
                                      default="full_size",
                                      options=["256px", "512px", "full_size"],
                                      tooltip="The latent image size used for calculating the initial noise for "
                                              "intensity correction. While smaller sizes result in a faster first "
                                              "step, they can lead to a less accurate correction",
                                     ),


                Divider("divider2"),#=========================================

                io.Float.Input       ("intensity",
                                      default=0.0, min=-1.0, max=1.0, step=0.1,
                                     tooltip="Initial noise amplitude used to enhance contrast and colors. A value "
                                             "of 1.0 is neutral; values below 1.0 create more muted images, while "
                                             "values above 1.0 increase contrast and saturation. This only takes "
                                             "effect when 'denoise' is set to 1.00 ",
                                     ),
                io.Float.Input       ("intensity_bias",
                                      default=0.0, min=-1.0, max=1.0, step=0.1,
                                      tooltip="Custom adjustment for the intensity correction noise bias. Usually kept "
                                              "at 0.0; used to fine-tune brightness. Note that its effect depends "
                                              "heavily on the prompt and image style, so it may not always act as a "
                                              "simple brightness control. Tweak it until it looks right to you. ",
                                     ),

                # io.Int.Input         ("turbo_creativity",
                #                       default=0, min=0, max=3,
                #                       tooltip="Boosts model creativity for more diverse compositions while maintaining "
                #                               "the general style. Be aware that this can lead to hallucinations and "
                #                               "isn't recommended for inpainting tasks. "
                #                      ),
                io.Combo.Input       ("turbo_creativity",
                                      default="no", options=list(TURBO_CREATIVITY.keys()),
                                      tooltip="Boosts model creativity for more diverse compositions while maintaining "
                                              "the general style. Be aware that this can lead to hallucinations and "
                                              "isn't recommended for inpainting tasks. "
                                     ),
                # io.Boolean.Input     ("smooth",
                #                       default=False, label_on="yes", label_off="no",
                #                       tooltip="???",
                #                      ),
                # io.Int.Input         ("turbo_creativity_extra_steps",
                #                       default=0, min=0, max=3,
                #                       tooltip="Additional steps to improve visual stability and structural coherence. "
                #                               "Higher values may help reduce hallucinations depending on image "
                #                               "complexity, though this will slow down the generation process. These "
                #                               "steps are specifically designed to counteract hallucinations caused "
                #                               "by 'Turbo Creativity'. "
                #                      ),
            ],
            outputs=[
                io.Latent.Output(display_name="latent_output",
                                 tooltip="The resulting denoised latent image, ready for decoding "
                                         "by a VAE or passed to another node for further processing. "
                                ),
            ]
        )

    #__ FUNCTION __________________________________________
    @classmethod
    def execute(cls,
                latent_input                : dict[str, Any],
                model                       : Any,
                positive                    : list,
                seed                        : int,
                steps                       : int,
                denoise                     : float,
                intensity                   : float,
                intensity_bias              : float,
                initial_sample_size         : str,
                turbo_creativity            : str,
                *,
                positive_stg2               : list | None = None,
                positive_stg3               : list | None = None,
                **kwargs
                ) -> io.NodeOutput:

        # set sigma limits when denoise is less than 1.0, typically used for inpainting
        sigma_limits = ( denoise**0.5 , 0 ) if denoise < 0.999 else None

        # `intensity` determines the level of noise overdose and noise bias
        initial_noise_overdose   = intensity * 0.4
        initial_noise_bias_level = (intensity+1)*4-1
        initial_noise_bias_level = min(max(initial_noise_bias_level, 0.0), 4.0)

        # apply user-defined adjustment to the calculated noise bias level
        initial_noise_bias_level += 10 * intensity_bias
        initial_noise_bias_level = min(max(initial_noise_bias_level, -5.0), 14.0)

        # # `turbo_creativity` triggers a shuffle of the image before sampler's "stage2"
        # stage2_shuffle = turbo_creativity

        # # `turbo_creativity_extra_steps` is the number of pre-processing steps
        # # before sampler's "stage2", used to try to give coherence to the image
        # # after shuffle
        # stage2_preproc_steps = turbo_creativity_extra_steps if stage2_shuffle else 0

        stage2_shuffle, stage2_preproc_steps = TURBO_CREATIVITY.get(turbo_creativity, (False,0))

        ## by now I didn't find practical use for noise injection, but I did
        ## some experiments to generate variation and details,
        ## here are some values ​​used in these tests:
        ## (32,64,512) : ( 7.5, 3.7, 1.0)
        ## (20,64,512) : (20.0, 1.0, 1.0)
        ## (20,40,512) : (18.0, 1.5, 1.0)
        ## (20,35,512) : (19.0, 1.0, 1.0)
        #   inject_noise_freqs  = (32,64,768)
        #   inject_noise_scales = ( 7.5, 3.7, 3.0)
        inject_noise_freqs  = None
        inject_noise_scales = None

        # run the Z-Sampler Turbo core method on the latent image
        latent_output = zsampler_turbo_core(latent_input, model, positive,
                                            seed                      = seed,
                                            steps                     = steps,
                                            initial_noise_bias_level  = initial_noise_bias_level,
                                            initial_noise_overdose    = initial_noise_overdose,
                                            noise_est_sample_size     = initial_sample_size,
                                            sigma_preset_name         = "bravo",
                                            sigma_limits              = sigma_limits,
                                            positive_stg2             = positive_stg2,
                                            positive_stg3             = positive_stg3,
                                            stage2_shuffle            = stage2_shuffle,
                                            stage2_preproc_steps      = stage2_preproc_steps,
                                            inject_noise_freqs        = inject_noise_freqs,
                                            inject_noise_scales       = inject_noise_scales,
                                            progress_preview = ProgressPreview.from_model( model ),
                                            )

        return io.NodeOutput(latent_output)
