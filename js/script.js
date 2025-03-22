$(document).ready(function () {
    var i = 1;

    function getPunchHtml(index) {
        return `
        <div class="flex items-center gap-2 mb-2" data-index="${index}">
            <input type="time" name="inTime[]" class="inTime flex-1 px-3 py-2 rounded bg-gray-700 border-gray-600 text-white" />
            <span>to</span>
            <input type="time" name="outTime[]" class="outTime flex-1 px-3 py-2 rounded bg-gray-700 border-gray-600 text-white" />
            <button class="addPunch p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-5 h-5 text-blue-500"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
            </button>
        </div>`;
    }

    $(document).on('click', '.addPunch', function () {
        $(this).replaceWith(`<button class="removePunch p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus w-5 h-5 text-red-500"><path d="M5 12h14"></path></svg>
            </button>`)
        $('.punchContent').find(`[data-index="${i}"]`).remove(); 
        $('.punchContent').append(getPunchHtml(i));
        i++;
        calculatePunchTime()
    });

    $(document).on('click', '.removePunch', function () {
        $(this).closest('[data-index]').remove();
        reindexData()
        calculatePunchTime()
    });

    function reindexData() {
        $('.punchContent .flex.items-center').each(function (index) {
            $(this).attr('data-index', index);
        });
        i = $('.punchContent .flex.items-center').length;
    }

    $("input[name='combined[]']").on('change', function(){
        var value = $(this).val().trim();
        let regex = /^(\d{1,2})h (\d{1,2})m\+?$/;
        let match = value.match(regex);

        if (match) {
            $(this).parents('tr').find('.hours').val(match[1]);
            $(this).parents('tr').find('.minutes').val(match[2]);
            let hours = parseInt(match[1]);
            let minutes = parseInt(match[2]);
            calculateTotalTime();
        } else {
            $(this).val('')
            $(this).parents('tr').find('.hours').val('');
            $(this).parents('tr').find('.minutes').val('');
        }
    })        
    
    $("input[name='hours[]']").on('change', function(){
        syncCombinedValue($(this));
        calculateTotalTime()
    })

    $("input[name='minutes[]']").on('change', function(){
        syncCombinedValue($(this));
        calculateTotalTime()
    })

    $("input[name='inTime[]']").on('change', function(){
        calculatePunchTime()
    })

    $("input[name='outTime[]']").on('change', function(){
        calculatePunchTime()
    })

    $("#alreadyCovered").on('change', function () {
        calculatePunchTime()
    });

    $("#needCover").on('change', function () {
        calculateTotalTime()
    });

});
function calculateTotalTime() {
    var totalHours = 0;
    var totalMinutes = 0;

    $("input[name='combined[]']").each(function (index, ele) {
        var value = $(ele).val().trim();

        var regex = /^(\d{1,2})h\s+(\d{1,2})m\+?$/;
        var match = value.match(regex);
        if (match) {
            var hours = parseInt(match[1]);
            var minutes = parseInt(match[2]);

            totalHours += hours;
            totalMinutes += minutes;

        } else {
            $(ele).val('');
        }
    });

    if (totalMinutes >= 60) {
        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;
    }

    $("#totalHours").text(`${totalHours}`);
    $("#totalMunites").text(`${totalMinutes}`);

    
    var totalRemainingTime = $("#needCover").val().trim();

    var regex = /^(\d{1,2})h\s+(\d{1,2})m\+?$/;
    var remainingMatch = totalRemainingTime.match(regex);
    if (remainingMatch) {
        remainingHours = parseInt(remainingMatch[1]);
        remainingMinutes = parseInt(remainingMatch[2]);

        remainingHours -= totalHours;
        remainingMinutes -= totalMinutes;

        if (remainingMinutes < 0) {
            remainingHours -= 1;
            remainingMinutes += 60;
        }

        if (remainingHours < 0) {
            remainingHours = 0;
            remainingMinutes = 0;
        }

    } else {
        $("#needCover").val('');
    }

    $("#remainingHours").text(`${remainingHours}`);
    $("#remainingMunites").text(`${remainingMinutes}`);

}

function calculatePunchTime() {
    var totalHours = 0;
    var totalMinutes = 0;

    var punchHours = 0;
    var punchMinutes = 0;

    var coverdTime = $("#alreadyCovered").val().trim();

    var regex = /^(\d{1,2})h\s+(\d{1,2})m\+?$/;
    var match = coverdTime.match(regex);
    if (match) {
        var hours = parseInt(match[1]);
        var minutes = parseInt(match[2]);

        totalHours += hours;
        totalMinutes += minutes;
    }

    $(".punchContent > .flex[data-index]").each(function (index, row) {
        let inTime = $(row).find("input[name='inTime[]']").val();
        let outTime = $(row).find("input[name='outTime[]']").val();

        if (!inTime || !outTime) {
            return;
        }

        let [inHours, inMinutes] = inTime.split(':').map(Number);
        let [outHours, outMinutes] = outTime.split(':').map(Number);

        let inTotalMinutes = inHours * 60 + inMinutes;
        let outTotalMinutes = outHours * 60 + outMinutes;

        if (outTotalMinutes < inTotalMinutes) {
            outTotalMinutes += 24 * 60;
        }

        let diffMinutes = outTotalMinutes - inTotalMinutes;

        let diffHours = Math.floor(diffMinutes / 60);
        let remainderMinutes = diffMinutes % 60;

        punchHours += diffHours;
        punchMinutes += remainderMinutes;
    });

    if (punchMinutes >= 60) {
        punchHours += Math.floor(punchMinutes / 60);
        punchMinutes = punchMinutes % 60;
    }

    $("#punchHours").text(punchHours);
    $("#punchMinutes").text(punchMinutes);

    let totalHoursSum = punchHours + totalHours;
    let totalMinutesSum = punchMinutes + totalMinutes;

    if (totalMinutesSum >= 60) {
        totalHoursSum += Math.floor(totalMinutesSum / 60);
        totalMinutesSum = totalMinutesSum % 60;
    }

    $("#punchTotalhours").text(totalHoursSum);
    $("#punchTotalmunites").text(totalMinutesSum);
}

function syncCombinedValue(element) {
    let index = $("input[name='hours[]']").index(element.closest('.flex').find("input[name='hours[]']"));

    let hoursInput = $("input[name='hours[]']").eq(index);
    let minutesInput = $("input[name='minutes[]']").eq(index);
    let combinedInput = $("input[name='combined[]']").eq(index);

    let hours = parseInt(hoursInput.val()) || 0;
    let minutes = parseInt(minutesInput.val()) || 0;

    combinedInput.val(`${hours}h ${minutes}m`);
}
