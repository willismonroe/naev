#ifdef HAS_GL_ARB_shader_subroutine
#extension GL_ARB_shader_subroutine : require

subroutine vec4 jump_func_prototype (void);
subroutine uniform jump_func_prototype jump_func;

#define JUMP_FUNC_PROTOTYPE  subroutine( jump_func_prototype )

#else /* HAS_GL_ARB_shader_subroutine */

#define JUMP_FUNC_PROTOTYPE

#endif /* HAS_GL_ARB_shader_subroutine */

// Libraries
#include "lib/math.glsl"
#include "lib/perlin.glsl"
#include "lib/cellular.glsl"

uniform float progress;
uniform float direction;
uniform vec2 dimensions;
in vec2 pos;
out vec4 color_out;

const vec4 colour_from = vec4( 1, 1, 1, 0 );
const vec4 colour_to   = vec4( 1, 1, 1, 1 );

JUMP_FUNC_PROTOTYPE
vec4 jump_default (void)
{
   return mix( colour_from, colour_to, progress );
}

JUMP_FUNC_PROTOTYPE
vec4 jump_nebula (void)
{
   const float scale       = 4.;
   const float smoothness  = 0.1;

   float n = abs( cnoise( pos * scale ) );
   float p = mix( -smoothness, 1. + smoothness, progress );
   float lower = p - smoothness;
   float higher = p + smoothness;
   float q = smoothstep( lower, higher, n );
   return mix( colour_from, colour_to, 1-q );
}

JUMP_FUNC_PROTOTYPE
vec4 jump_organic (void)
{
   const float scale       = 20.;
   const float smoothness  = 0.1;

   float n = cellular2x2( pos * scale ).x;
   float p = mix( -smoothness, 1. + smoothness, progress );
   float lower = p - smoothness;
   float higher = p + smoothness;
   float q = smoothstep( lower, higher, n );
   return mix( colour_from, colour_to, 1-q );
}

JUMP_FUNC_PROTOTYPE
vec4 jump_circular (void)
{
   const float smoothness  = 0.3;
   const vec2 center       = vec2( 0.5, 0.5 );

   float m = smoothstep(-smoothness, 0.0, M_SQRT2 * distance(center, pos) - (1-progress)*(1.+smoothness));
   return mix( colour_from, colour_to, m );
}

JUMP_FUNC_PROTOTYPE
vec4 jump_wind (void)
{
   const float size        = 0.1;
   const float smoothness  = 0.1;
   const float jaggedness  = 200.;
   const vec2 center       = vec2( 0.5, 0.5 );

   // Create rotation matrix
   float s = sin(direction);
   float c = cos(direction);
   float l = sqrt( s*s + c*c );
   mat2 R = mat2( c, -s, s, c );

   // Compute new scaled coordinates
   vec2 lpos = pos * dimensions / dimensions.x;
   lpos = l * (1.0-2.0*(smoothness+size)) * lpos + smoothness + size;
   vec2 uv = R * (lpos - center) + center;

   // Compute noise
   float n = uv.x + 2*size*cnoise( jaggedness * vec2( 0, uv.y ) );

   // Magic!
   float p = mix( -smoothness, 1. + smoothness, 1-progress );
   float lower = p - smoothness;
   float higher = p + smoothness;
   float q = smoothstep( lower, higher, n );

   return mix( colour_from, colour_to, q );
}

void main(void)
{
#ifdef HAS_GL_ARB_shader_subroutine
   // Use subroutines
   color_out = jump_func();
#else /* HAS_GL_ARB_shader_subroutine */
   //* Just use default
   color_out = jump_wind();
#endif /* HAS_GL_ARB_shader_subroutine */
}
