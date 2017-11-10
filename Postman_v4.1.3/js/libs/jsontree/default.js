//This used to use jQuery, but was rewritten in plan DOM for speed and to get rid of the jQuery dependency.
function jv_collapse(evt) {
	var collapser = evt.target;

	var target = collapser.parentNode.getElementsByClassName('collapsible jv');

	if ( ! target.length ) {
		return;
	}

	target = target[0];

	if ( target.style.display == 'none' ) {
		var ellipsis = target.parentNode.getElementsByClassName('ellipsis jv')[0];
		target.parentNode.removeChild(ellipsis);
		target.style.display = '';
	} else {
		target.style.display = 'none';

		var ellipsis = document.createElement('span');
		ellipsis.className = 'ellipsis jv';
		ellipsis.innerHTML = ' &hellip; ';
		target.parentNode.insertBefore(ellipsis, target);
	}

	//collapser.innerHTML = ( collapser.innerHTML == '-' ) ? '+' : '-';
	$(collapser).toggleClass("minus").toggleClass("plus");
}

function jv_addCollapser(item) {
	// This mainly filters out the root object (which shouldn't be collapsible)
	if ( item.nodeName != 'LI' ) {
		return;
	}

	var collapser = document.createElement('div');
	collapser.className = 'collapser jv minus';
	collapser.addEventListener('click', jv_collapse, false);
	item.insertBefore(collapser, item.firstChild);
}






