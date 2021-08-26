require('bootstrap-sass');
require('../sass/style.scss');
require('jquery-ui');
import { toDari } from './dari';

var speaker;

$(document).ready(function() {

    $('.search-form #search-field').on('keyup paste cut', convert);
    $('.search-form #search-field').on('keyup paste cut', autoSuggest);
    $(window).on('click', () => {
        $('.suggestions-container').addClass('hidden');
    });
    $('.voice').on('click', speak);
    $('.header-search-tabs').on('click', setSearchButtons);
    $('.suggest-link').on('click', suggestClicked);
    $('.suggest-form .form-close').on('click', removeSuggestForm);
    $('.suggest-form input[type="submit"]').on('click', submitSuggestion);
    $('#new-word-form').on('submit', submitNewWord);
    $('.search-icon').on('click', submitSearchForm);
    $('#signup-form').on('submit', submitSignupForm);
    pageLoadAnimations();

})
let timer;

function convert(event) {
    if (notValidKey(event.keyCode)) {
        return;
    }
    if ($('.header-search-tabs button.active').data('search-url') === '/dari') {
        let searchedStr = toDari($(this).val(), event.shiftKey);
        $(this).val(searchedStr);
    }

}

function autoSuggest(event) {

    let self = this;
    // if (notValidKey(event.keyCode)) {
    //     return;
    // }
    let urlPath = $('.header-search-tabs button.active').data('search-url');
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(function() {
        $.ajax(`/api${urlPath}/words/` + $(self).val())
            .done(updateAutoSuggest)
            .fail(function(error) {
                console.log('error', error);
            })
            .always(function() {
                console.log('I promise to always log data.');
            });
    }, 0);
}

function notValidKey(keyCode) {
    // These are the keycodes that are invisible so shouldn't trigger ajax or translation
    console.log('wouldnt get triggered by this', keyCode);
    const keyArrs = [undefined, 37, 38, 39, 40, 20, 16, 17, 18, 19, 27, 33, 35, 43, 36, 45, 93, 112];
    return keyArrs.includes(keyCode);
}


function updateAutoSuggest(words) {
    if (!Array.isArray(words)) {
        words = Array.from(words);
    }
    let html = words.reduce((acc, curr) => {
        return acc + `<li data-value="${curr.serial}"><a href="/word/${curr.word}">${curr.word}</a></li>`;
    }, '');
    $('#suggestion-list').html(html);
    showHideClass(words);
}

function showHideClass(words) {
    if (!words || words.length === 0) {
        $('.suggestions-container').addClass('hidden');
    } else if ($('.suggestions-container').hasClass('hidden')) {
        $('.suggestions-container').removeClass('hidden');
    }
}



function speak() {
    let word = $(this).data('word');
    if (word) {
        var msg = new window.SpeechSynthesisUtterance(word);
        msg.voice = speaker;
        window.speechSynthesis.speak(msg);
    }
}

/** this function for some reason doesn't work **/
function getVoice(speaker) {
    return window.speechSynthesis.getVoices().filter(function(voice) {
        return voice.name === speaker;
    })[0];
}

window.speechSynthesis.onvoiceschanged = function() {
    speaker = getVoice('Samantha');
}


function setSearchButtons(event) {
    if (event.target.nodeName === 'BUTTON') {
        $(this).find('button').each((index, elm) => {
            if (event.target.className === elm.className) {
                $(elm).addClass('active');
                $('.search-container').addClass('search-' + $(elm).data('ref'));
            } else {
                $(elm).removeClass('active');
                $('.search-container').removeClass('search-' + $(elm).data('ref'));
            }

            if ($(elm).hasClass('dari-tab active')) {
                $('#search-field').attr('placeholder', ' .You can type dari here');
            } else {
                $('#search-field').attr('placeholder', '');
            }

        });
        $('#search-field').val('');
    }

}

function suggestClicked(event) {
    event.preventDefault();
    $(this).toggleClass('hidden');
    $(this).closest('.card-box').find('.suggest-form').toggleClass('hidden');
}

function removeSuggestForm() {
    $(this).closest('.suggest-form').toggleClass('hidden');
    $(this).closest('.card-box').find('.suggest-link').toggleClass('hidden');
}

function submitSuggestion(event) {
    event.preventDefault();
    let suggestions = $(this).closest('.suggest-form').find('textarea').val();
    if (suggestions.length > 0) {
        let urlPath = $('.header-search-tabs button.active').data('search-url');
        let url = `/api${urlPath}/suggestions/`;
        sendToServer($(this).closest('.suggest-form'), url);
        showThankYou($(this).closest('.card-box'));
    }
}

function submitNewWord(event) {
    event.preventDefault();
    let url = `/api/words/`;
    sendToServer($(this).closest('form'), url);
    showThankYou($(this).closest('.card-box'), null, redirect.bind('../'));
}

function sendToServer(suggestions, url) {
    $.post(url, suggestions.serialize())
        .done(response => {
            console.log(response);
        })
        .fail(error => {
            console.log(error);
        });
}

function showThankYou(container, message, cb) {
    message = message || `<p class="italic pull-right padding-top-normal text-smaller animate" data-animation="fadeOut">
    Thank you for helping us expand Dari Dictionary.</p>`;

    let form = $(container).find('form');
    if (form) {
        $(form).addClass('hidden');
    }
    animate(container, message, cb);
}

function pageLoadAnimations() {
    $('.animate').each((index, elm) => animate(null, elm, removeURLParams));
}



function animate(container, elm, cb) {
    let animation = $(elm).data('animation');

    if (animation && animation === 'fadeIn') {
        elm = elm.substr(0, elm.indexOf('>')) + ` style="display:none; opacity:1;"` + elm.substr(elm.indexOf('>'));
    }
    if (container) {
        $(container).append($(elm));
    }

    if (animation) {
        $('.animate')[animation](4000, cb);
    }
}

function submitSearchForm() {
    let word = $('#search-field').val();
    if (word) {
        redirect(`../word/${word}`);
    }
}

function submitSignupForm(event) {
    event.preventDefault();
    let url = `/signup`;
    sendToServer($(this), url);
    let note = `<p class="italic text-center padding-top-normal text-smaller animate border-bottom-small" data-animation="fadeIn">
    Thank you for signing up. Please check your inbox for confirmation email.</p>`;
    showThankYou($(this).closest('.widget'), note);
}

/** Bounded redirect function */
function redirect(url) {
    window.location.href = url || this;
}

function removeURLParams() {
    window.location.href = window.location.origin + window.location.pathname;
}
