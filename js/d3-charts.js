// Bar Chart Variables
var svg_div = d3.select("svg"),
margin = {top: 20, right: 20, bottom: 30, left: 40},
width = +svg_div.attr("width") - margin.left - margin.right,
height = +svg_div.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg_div.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Pie Chart Variables
var width_pie = 260;
var height_pie = 260;
var radius = Math.min(width_pie, height_pie) / 2;
var legendRectSize = 18;
var legendSpacing = 4;
var color = d3.scaleOrdinal(d3.schemeCategory20b);


// styling body
d3.select("body")
    .style("color", "black")
    .style("background-color", "white");

// FETCHING DATA
const url = 'https://dcc.icgc.org/api/v1/projects/GBM-US/mutations?field=id,mutation,type,chromosome,start,end&size=100&order=desc';
var results = fetch(url)
.then((resp) => resp.json())
.then(function(data) {
    
    return data.hits;

})
.catch(function(error) {
    console.log(JSON.stringify(error));
}); 

var p = Promise.resolve(results);

p.then(function(v) {
    
    var flags = [];  // flags is used to get distinct values
    var distinct_mutations = []; // distinct_mutations for mutation details
    var l = v.length; // hits length
    var i; // for loops counter
    var temp_count; // for counting elements frequency
    var mut_obj_array = []; // mutation details & frequency object array
    var chrom_obj_array = []; // chromosomes types & frequency object array
    var type_obj_array = []; // mutation type & frequency object array
    
    // array of chromosomes
    var chrom = ["1","2","3","4","5","6","7","8","9","10","11","12","13", "14","15","16","17","18","19","20","21","22", "X", "Y"];

    // array of types
    var distinct_types = [];

    // the following variables are used in the update_charts functions
    var ctr_i;
    var new_data = [];
    var temp_ctr;
    var temp_obj;

    chrom.forEach(function (item_d,index_d){
        // k item d_m, i index d_m
        temp_count = 0;
        for( i=0; i<l; i++) {
            if(v[i].chromosome === item_d){
                temp_count+=1;
            }
        }
        var chrom_obj = {
            chrom_type : item_d,
            frequency  : temp_count
        };
        chrom_obj_array.push(chrom_obj);
        // count_chrom.push(temp_count);
    });

    console.log('Chrom_OBJ : ' , chrom_obj_array);


    //distinct mut_type
    for( i=0; i<l; i++) {
        if( flags[v[i].type]) continue;
        flags[v[i].type] = true;
        distinct_types.push(v[i].type);
    }
    console.log('TYPES ' , distinct_types);
    distinct_types.forEach(function (item_d,index_d){
        // k item d_m, i index d_m
        temp_count = 0;
        for( i=0; i<l; i++) {
            if(v[i].type===item_d){
                temp_count+=1;
            }
        }
        var type_obj = {
            type_atr : item_d,
            frequency  : temp_count
        };
        type_obj_array.push(type_obj);
    });
     console.log('TYPE_OBJ ' , type_obj_array);

   


    // distinct mut_details
    for( i=0; i<l; i++) {
        if( flags[v[i].mutation]) continue;
        flags[v[i].mutation] = true;
        distinct_mutations.push(v[i].mutation);
    }
    console.log('MUTATIONS ' , distinct_mutations);
    // count occurences of distinct mutations
    
    
    distinct_mutations.forEach(function (item_d,index_d){
        // k item d_m, i index d_m
        temp_count = 0;
        for( i=0; i<l; i++) {
            if(v[i].mutation===item_d){
                temp_count+=1;
            }
        }
        var mut_obj = {
            mut_type : item_d,
            frequency  : temp_count
        };
        mut_obj_array.push(mut_obj);
    });


    // max_count = Math.max(...count_mut);
    // Array of mutation type & frequency object

    console.log('MUT_OBJ_ARRAY ' , mut_obj_array);


    ///// DRAW /////
    
    // BAR CHART 
    x.domain(chrom_obj_array.map(function(d) { return d.chrom_type; }));
    y.domain([0, d3.max(chrom_obj_array, function(d) { return d.frequency; })]);

    g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    // 
    g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(10), "%")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Frequency").attr("fill","black");


    var bar = g.selectAll(".bar")
    .data(chrom_obj_array)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.chrom_type); })
    .attr("y", function(d) { return y(d.frequency); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.frequency); })
    .on("mouseover",function(d){
        update_charts("Update_Pie",d.chrom_type);
    })
    .on("mouseout",function(){
        reset_charts("Update_Pie");
    });



/// adding text  // needs improvement
    bar.append('text')
    .attr("class", "value")
    .attr("fill", "white")
    .attr("dy", ".3em")
    .attr("x", function(d,i) {
        return x(d.chrom_type);
    })
    .attr("y", function(d,i) {
        return y(d.frequency);
    })
    .text(function(d){
         return d.frequency;
    });

   

    // PIE CHART
    var svg = d3.select('#chart')
    .append('svg')
    .attr('width', width_pie)
    .attr('height', height_pie+130)
    .append('g')
    .attr('transform', 'translate(' + ((width_pie) / 2) +
    ',' + ((height_pie+60) / 2) + ')');

    var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

    var pie = d3.pie()
    .value(function(d) { return d.frequency; })
    .sort(null);

    // adding a tooltip
    

    var path = svg.selectAll('path')
      .data(pie(type_obj_array))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d) {
        return color(d.data.type_atr);
      })
      .on("mouseover",function(d){
        // draw_tooltip(d.data);
        update_charts("Update_Bar",d.data.type_atr);
      })
      .on("mouseout",function(){
        // remove_tooltip();
        reset_charts("Update_Bar");
      });


     // adding legend
    var legend = svg.selectAll('.legend')                 
      .data(color.domain())                               
      .enter()                                             
      .append('g')                                         
      .attr('class', 'legend')                            
      .attr('transform', function(d, i) {               
        var height = legendRectSize + legendSpacing;       
        var offset =  (-4.5)*height * color.domain().length / 2;
        var horz = -2 * legendRectSize*(2);                       // NEW
        var vert = i * height - offset;                       // NEW
        return 'translate(' + horz + ',' + vert + ')';        // NEW
      });

    legend.append('rect')                                     // NEW
    .attr('width', legendRectSize)                          // NEW
    .attr('height', legendRectSize)                         // NEW
    .style('fill', color)                                   // NEW
    .style('stroke', color);                                // NEW

    legend.append('text')                                     // NEW
    .attr('x', legendRectSize + legendSpacing+5)              // NEW
    .attr('y', legendRectSize - legendSpacing)  
    .text(function(d) { return d; });  

    // reset function
    var reset_charts = function(update){
        var bars_rst;
        var pie_rst;
        if(update === "Update_Bar"){
            bars_rst = g.selectAll(".bar")
                        .remove()
                        .exit()
                        .data(chrom_obj_array);
            bars_rst.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.chrom_type); })
            .attr("y", function(d) { return y(d.frequency); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.frequency); })
            .on("mouseover",function(d){
                update_charts("Update_Pie",d.chrom_type);
            })
            .on("mouseout",function(){
                reset_charts("Update_Pie");
            });
        }
        if(update === "Update_Pie"){
            pie_rst = svg.selectAll("path")
                        .remove()
                        .exit()
                        .data(pie(type_obj_array));
            pie_rst.enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function(d) {
                return color(d.data.type_atr);
            })
            .on("mouseover",function(d){
            // draw_tooltip(d.data);
                update_charts("Update_Bar",d.data.type_atr);
            })
            .on("mouseout",function(){
            // remove_tooltip();
                reset_charts("Update_Bar");
            });
        }
    };


    // update function
    var update_charts = function(update,data){

        if(update === "Update_Bar"){
            update_bar(data);
        }
        if(update === "Update_Pie"){
            update_pie(data);
        }
    };

    var update_bar = function(data){

        new_data = [];
        chrom_obj_array.forEach( function (item_d,index_d){
            temp_ctr = 0;
            for (ctr_i = 0; ctr_i < v.length; ctr_i++) {
                var current = v[ctr_i];
                var chrom_t = item_d.chrom_type;
                

                if (data === current.type &&  chrom_t === current.chromosome ){
                    temp_ctr += 1;
                }
            }
            temp_obj = {
                chrom_type : chrom_t,
                frequency  : temp_ctr
                };
            new_data.push(temp_obj);
        });
        
        
        var bars_new = g.selectAll(".bar")
                        .remove()
                        .exit()
                        .data(new_data);

        bars_new.enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.chrom_type); })
            .attr("y", function(d) { return y(d.frequency); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.frequency); });

    }

    var update_pie = function(data){
        
        new_data = [];
        type_obj_array.forEach(function(item_d, index_d){
            temp_ctr = 0;
            for (ctr_i = 0; ctr_i < v.length; ctr_i++) {
                var current = v[ctr_i];
                var mutation_t = item_d.type_atr;
                

                if (data === current.chromosome &&  mutation_t === current.type ){
                    temp_ctr += 1;
                }
            }
            temp_obj = {
                type_atr : mutation_t,
                frequency  : temp_ctr
                };
            new_data.push(temp_obj);
        });
        var new_pie = svg.selectAll('path')
                    .remove()
                    .exit()
                    .data(pie(new_data));
        new_pie.enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d) {
            return color(d.data.type_atr);
        });
    };

    console.log("DATASET",v);
});

