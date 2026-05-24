import { defineField, defineType } from "sanity";
                                                              
  export const homePageType = defineType({
    name: "homePage",                                         
    title: "Home Page",
    type: "document",
    fields: [
      defineField({
        name: "language",
        title: "Language",
        type: "string",
        options: {                                            
          list: [
            { title: "English", value: "en" },                
            { title: "Spanish", value: "es" },
            { title: "Arabic", value: "ar" },
          ],
        },
      }),
      defineField({                                           
        name: "heroTitle",
        title: "Hero Title",                                  
        type: "string",
      }),
      defineField({
        name: "heroPrimaryButton",
        title: "Hero Primary Button (Apply Now)",             
        type: "object",
        fields: [                                             
          defineField({
            name: "text",
            title: "Button Text",
            type: "string",
          }),                                                 
          defineField({
            name: "link",                                     
            title: "Button Link",
            type: "string",
          }),
        ],
      }),
      defineField({
        name: "heroSecondaryButton",
        title: "Hero Secondary Button (Track)",
        type: "object",                                       
        fields: [
          defineField({                                       
            name: "text",
            title: "Button Text",
            type: "string",
          }),
          defineField({
            name: "link",
            title: "Button Link",
            type: "string",                                   
          }),
        ],                                                    
      }),              
      defineField({
        name: "processingOptions",
        title: "Processing Speed Options",
        type: "array",
        of: [                                                 
          {
            type: "object",                                   
            fields: [  
              defineField({
                name: "name",
                title: "Option Name (Urgent/Standard)",
                type: "string",
              }),                                             
              defineField({
                name: "time",                                 
                title: "Processing Time",
                type: "string",
                description: "e.g., '3 Hours' or '3–5 BusinessDays'",                    
              }),
            ],                                                
          },           
        ],
      }),
      defineField({
        name: "steps",
        title: "Application Steps",
        type: "array",
        of: [                                                 
          {
            type: "object",                                   
            fields: [  
              defineField({
                name: "title",
                title: "Step Title",
                type: "string",
              }),
              defineField({
                name: "description",
                title: "Step Description",
                type: "string",                               
              }),
              defineField({                                   
                name: "color",
                title: "Icon Color (hex)",
                type: "string",
                description: "e.g., #E8671A",
              }),
            ],                                                
          },
        ],                                                    
      }),              
      defineField({
        name: "faqs",
        title: "FAQ Items",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              defineField({
                name: "question",                             
                title: "Question",
                type: "string",                               
              }),      
              defineField({
                name: "answer",
                title: "Answer",
                type: "text",
                rows: 3,
              }),
            ],
          },                                                  
        ],
      }),                                                     
      defineField({
        name: "seoContent",
        title: "SEO Content (bottom of page, with Read More)",
        type: "array",
        of: [{ type: "block" }],
        description: "Rich text shown before the footer with a Read More toggle",
      }),
      defineField({
        name: "slug",
        title: "Slug",
        type: "slug",
        options: {
          source: "heroTitle",
        },
      }),
    ],
  });