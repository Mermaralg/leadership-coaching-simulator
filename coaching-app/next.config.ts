import type { NextConfig } from "next";                                                

                                                                                          

   const nextConfig: NextConfig = {                                                       

     outputFileTracingIncludes: {                                                         

       '/api/chat': ['./lib/data/**/*'],                                                  

     },                                                                                   

   };                                                                                     

                                                                                          

   export default nextConfig;                                                             

