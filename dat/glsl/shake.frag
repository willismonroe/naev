uniform sampler2D MainTex;
in vec4 VaryingTexCoord;
out vec4 color_out;

uniform vec2 shake_pos = vec2( 0.0, 0.0 );
uniform vec2 shake_vel = vec2( 0.0, 0.0 );
uniform float shake_force = 0.0;

const float VEL_FACTOR = 1.0/8.0;

void main (void)
{
   vec2 uv = VaryingTexCoord.st + shake_pos;

   /* Lens Distortion. */
   float aberration = pow( length( uv * 2.0 - 1.0 ), 2.0 );
   uv = uv - (uv * 2.0 - 1.0) * aberration * shake_force * (1.0 / 16.0);

   /* Blur. */
   color_out  = texture( MainTex, uv ) * 0.4;
   color_out += texture( MainTex, uv - 1.0 * VEL_FACTOR * shake_vel ) * 0.3;
   color_out += texture( MainTex, uv - 2.0 * VEL_FACTOR * shake_vel ) * 0.2;
   color_out += texture( MainTex, uv - 3.0 * VEL_FACTOR * shake_vel ) * 0.1;

   /*color_out = blur9( MainTex, uv, vec2(16.0), shake_vel );*/
}
