/**
 * jspsych-survey-multi-choice
 * a jspsych plugin for multiple choice survey questions
 *
 * Shane Martin
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['survey-multi-choice-select-unique'] = (function() {
  var plugin = {};

  plugin.info = {
    name: 'survey-multi-choice-select-unique',
    description: '',
    parameters: {
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        nested: {
          prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Prompt',
            default: undefined,
            description: 'The strings that will be associated with a group of options.'
          },
          options: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Options',
            array: true,
            default: [],
            description: 'Displays options for an individual question.'
          },
          required: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Required',
            default: false,
            description: 'Subject will be required to pick an option for each question.'
          },
          horizontal: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Horizontal',
            default: false,
            description: 'If true, then questions are centered and options are displayed horizontally.'
          },
          name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Question Name',
            default: '',
            description: 'Controls the name of data values associated with this question'
          },
          blank: {
              type: jsPsych.plugins.parameterType.INTEGER,
              pretty_name: 'Mistake function',
              default: -1,
              description: 'Function called if check_answers is set to TRUE and there is a difference between the participants answers and the correct solution provided in the text.'
          },
          corpus: {
              type: jsPsych.plugins.parameterType.INTEGER,
              pretty_name: 'Corpus',
              default: -1,
              description: 'Entire list of possible correct options.'
          },
          trial_label: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Button label',
            default:  'Continue',
            description: 'Label of the button.'
          },
          order:{
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'order of appearance',
            default:  '',
            description: 'order of appearance in test.'
          },
          block:{
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'order of appearance',
            default:  '',
            description: 'order of appearance in test.'
          }
        }
      },
      randomize_question_order: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Randomize Question Order',
        default: true,
        description: 'If true, the order of the questions will be randomized'
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'Label of the button.'
      }
    }
  }
  plugin.trial = function(display_element, trial) {
    var plugin_id_name = "jspsych-survey-multi-choice";

    var html = "";

    // inject CSS for trial
    html += '<style id="jspsych-survey-multi-choice-css">';
    html += ".jspsych-survey-multi-choice-question { margin-top: 2em; margin-bottom: 2em; text-align: left; }"+
      ".jspsych-survey-multi-choice-text span.required {color: darkred;}"+
      ".jspsych-survey-multi-choice-horizontal .jspsych-survey-multi-choice-text {  text-align: center;}"+
      ".jspsych-survey-multi-choice-option { line-height: 2; }"+
      ".jspsych-survey-multi-choice-horizontal .jspsych-survey-multi-choice-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}"+
      "label.jspsych-survey-multi-choice-text input[type='radio'] {margin-right: 1em;}";
    html += '</style>';

    // show preamble text
    if(trial.preamble !== null){
      html += '<div id="jspsych-survey-multi-choice-preamble" class="jspsych-survey-multi-choice-preamble">'+trial.preamble+'</div>';
    }

    // form element
    html += '<form id="jspsych-survey-multi-choice-form">';

    // generate question order. this is randomized here as opposed to randomizing the order of trial.questions
    // so that the data are always associated with the same question regardless of order
    var question_order = [];
    for(var i=0; i<trial.questions.length; i++){
      question_order.push(i);
    }
    if(trial.randomize_question_order){
      question_order = jsPsych.randomization.shuffle(question_order);
    }

    // add multiple-choice questions
    for (var i = 0; i < trial.questions.length; i++) {

      // get question based on question_order
      var question = trial.questions[question_order[i]];
      var question_id = question_order[i];

      // make prompt with blank
      var elements = question.prompt.split(' ');
      if (question.blank == -1) {
        // question.options = elements
          while (question.options.length < 4){
            question.blank = getRandomInt(elements.length - 1);
            question.options = get_options(question.prompt,question.options,question.blank,question.corpus['statements'],question.corpus['mydict']);
            console.log(question.options);
          }
      };

      if (question.blank == -2) {
        // question.options = elements
        question.blank = getRandomInt(elements.length - 1);
        question.options = Object.values(question.corpus['mydict']).sort();
      };

      question.prompt = ''
      for (i=0; i<elements.length; i++)
      {
          if (i != question.blank)
          {
              question.prompt += elements[i] + ' ';
          }
          else
          {
              // solutions.push(elements[i].trim());
              // html += '<input type="text" id="input'+(solutions.length-1)+'" value="">' + ' ';
              question.prompt += '______' + ' ';
          };
      };

      // create question container
      var question_classes = ['jspsych-survey-multi-choice-question'];
      if (question.horizontal) {
        question_classes.push('jspsych-survey-multi-choice-horizontal');
      }

      html += '<div id="jspsych-survey-multi-choice-'+question_id+'" class="'+question_classes.join(' ')+'"  data-name="'+question.name+'">';

      // add question text
      html += '<p class="jspsych-survey-multi-choice-text survey-multi-choice">' + question.prompt
      if(question.required){
        html += "<span class='required'></span>";
      }
      html += '</p>';

      // TODO start of options w


      // shuffle(question.options)
      // create option radio buttons
      for (var j = 0; j < question.options.length; j++) {
        // add label and question text
        var option_id_name = "jspsych-survey-multi-choice-option-"+question_id+"-"+j;
        var input_name = 'jspsych-survey-multi-choice-response-'+question_id;
        var input_id = 'jspsych-survey-multi-choice-response-'+question_id+'-'+j;

        var required_attr = question.required ? 'required' : '';

        // add radio button container
        html += '<div id="'+option_id_name+'" class="jspsych-survey-multi-choice-option">';
        html += '<input type="radio" name="'+input_name+'" id="'+input_id+'" value="'+question.options[j]+'" '+required_attr+'></input>';
        html += '<label class="jspsych-survey-multi-choice-text" for="'+input_id+'">'+question.options[j]+'</label>';
        html += '</div>';
      }

      html += '</div>';
    }

    // add submit button
    html += '<input type="submit" id="'+plugin_id_name+'-next" class="'+plugin_id_name+' jspsych-btn"' + (trial.button_label ? ' value="'+trial.button_label + '"': '') + '></input>';
    html += '</form>';

    // render
    display_element.innerHTML = html;

    document.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      for(var i=0; i<trial.questions.length; i++){
        var match = display_element.querySelector('#jspsych-survey-multi-choice-'+i);
        var id = "Q" + i;
        if(match.querySelector("input[type=radio]:checked") !== null){
          var val = match.querySelector("input[type=radio]:checked").value;
        } else {
          var val = "";
        }
        var obje = {};
        var name = id;
        if(match.attributes['data-name'].value !== ''){
          name = match.attributes['data-name'].value;
        }
        obje[name] = val;
        Object.assign(question_data, obje);
      }
      // save data
      var trial_data = {
        "rt": response_time,
        "responses": question.options,
        // "question_order": JSON.stringify(question_order),
        'prompt':question.prompt,
        'correct_response': elements[question.blank],
        'is_correct': val == elements[question.blank],
        'trial_label': question.trial_label,
        'order':question.order,
        'block':question.block
      };
      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trial_data);
    });

    var startTime = performance.now();
  };

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max + 1));
  }

  function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
  }

  // given prompt, get all other words that occur in that prompt
  function get_options(question,words, position, corpus, dict){
    console.log('get options')
    // console.log(question);
    // console.log(words);
    console.log(position);
    // console.log(corpus);
    // console.log(Object.values(dict));

    // make regex
    var split_question = question.split(' ');

    var regex = '';
    for(var i = 0; i < split_question.length; i ++){
      if (i != position){
        regex = regex.concat(split_question[i], ' ');

      } else {
        regex = regex.concat('\\w*',' ');
      };
    };
    regex = regex.trim();
    regex = new RegExp(regex,'g');

    var overlaps = [];
    for(var i = 0; i < corpus.length; i++){
      if (corpus[i].match(regex)){
          overlaps.push(corpus[i].match(regex)[0])
      };
    };

    var alternates = new Set(Object.values(dict));
    for (var i = 0; i < overlaps.length; i++){
      var split_overlap = overlaps[i].split(' ');
      alternates.delete(split_overlap[position]);
    };
    for (var i = 0; i < split_question.length;i++){
      alternates.delete(split_question[i]);
    }
    // console.log(alternates);

    var alternates = Array.from(alternates);
    shuffle(alternates);
    // console.log(alternates);

    var out_options = [];
    console.log(out_options);
    // if (position == 1){
    //   out_options.push(dict['near_to']);
    //   out_options.push(dict['far_from']);
    // } else {
    out_options.push(split_question[position]);
    //   console.log(split_question);
    //   console.log(out_options);
    // }

    while ((out_options.length < 4) & (alternates.length > 0)) {
      out_options.push(alternates.pop());
      out_options = new Set(out_options);
      out_options = Array.from(out_options);

    }


    shuffle(out_options);

    // alternates.push(split_question[position]);

    return out_options;

    // (split_question[position])



  };



  return plugin;
})();
