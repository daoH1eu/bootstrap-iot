$().ready(function() {
    $sidebar = $('.sidebar');
    $sidebar_img_container = $sidebar.find('.sidebar-background');

    $full_page = $('.full-page');

    $sidebar_responsive = $('body > .navbar-collapse');

    window_width = $(window).width();

    fixed_plugin_open = $('.sidebar .sidebar-wrapper .nav li.active a p').html();

    if (window_width > 767 && fixed_plugin_open == 'Dashboard') {
        if ($('.fixed-plugin .dropdown').hasClass('show-dropdown')) {
            $('.fixed-plugin .dropdown').addClass('show');
        }

    }

    $('.fixed-plugin a').click(function(event) {
        // Alex if we click on switch, stop propagation of the event, so the dropdown will not be hide, otherwise we set the  section active
        if ($(this).hasClass('switch-trigger')) {
            if (event.stopPropagation) {
                event.stopPropagation();
            } else if (window.event) {
                window.event.cancelBubble = true;
            }
        }
    });

    $('.fixed-plugin .background-color span').click(function() {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');

        var new_color = $(this).data('color');

        if ($sidebar.length != 0) {
            $sidebar.attr('data-color', new_color);
        }

        if ($full_page.length != 0) {
            $full_page.attr('filter-color', new_color);
        }

        if ($sidebar_responsive.length != 0) {
            $sidebar_responsive.attr('data-color', new_color);
        }
    });

    $('.fixed-plugin .img-holder').click(function() {
        $full_page_background = $('.full-page-background');

        $(this).parent('li').siblings().removeClass('active');
        $(this).parent('li').addClass('active');


        var new_image = $(this).find("img").attr('src');

        if ($sidebar_img_container.length != 0 && $('.switch-sidebar-image input:checked').length != 0) {
            $sidebar_img_container.fadeOut('fast', function() {
                $sidebar_img_container.css('background-image', 'url("' + new_image + '")');
                $sidebar_img_container.fadeIn('fast');
            });
        }

        if ($full_page_background.length != 0 && $('.switch-sidebar-image input:checked').length != 0) {
            var new_image_full_page = $('.fixed-plugin li.active .img-holder').find('img').data('src');

            $full_page_background.fadeOut('fast', function() {
                $full_page_background.css('background-image', 'url("' + new_image_full_page + '")');
                $full_page_background.fadeIn('fast');
            });
        }

        if ($('.switch-sidebar-image input:checked').length == 0) {
            var new_image = $('.fixed-plugin li.active .img-holder').find("img").attr('src');
            var new_image_full_page = $('.fixed-plugin li.active .img-holder').find('img').data('src');

            $sidebar_img_container.css('background-image', 'url("' + new_image + '")');
            $full_page_background.css('background-image', 'url("' + new_image_full_page + '")');
        }

        if ($sidebar_responsive.length != 0) {
            $sidebar_responsive.css('background-image', 'url("' + new_image + '")');
        }
    });

    $('.switch input').on("switchChange.bootstrapSwitch", function() {

        $full_page_background = $('.full-page-background');

        $input = $(this);

        if ($input.is(':checked')) {
            if ($sidebar_img_container.length != 0) {
                $sidebar_img_container.fadeIn('fast');
                $sidebar.attr('data-image', '#');
            }

            if ($full_page_background.length != 0) {
                $full_page_background.fadeIn('fast');
                $full_page.attr('data-image', '#');
            }

            background_image = true;
        } else {
            if ($sidebar_img_container.length != 0) {
                $sidebar.removeAttr('data-image');
                $sidebar_img_container.fadeOut('fast');
            }

            if ($full_page_background.length != 0) {
                $full_page.removeAttr('data-image', '#');
                $full_page_background.fadeOut('fast');
            }

            background_image = false;
        }
    });
});

type = ['primary', 'info', 'success', 'warning', 'danger'];

demo = {
    initPickColor: function() {
        $('.pick-class-label').click(function() {
            var new_class = $(this).attr('new-class');
            var old_class = $('#display-buttons').attr('data-class');
            var display_div = $('#display-buttons');
            if (display_div.length) {
                var display_buttons = display_div.find('.btn');
                display_buttons.removeClass(old_class);
                display_buttons.addClass(new_class);
                display_div.attr('data-class', new_class);
            }
        });
    },

    // initDashboardPageCharts: function(time, temp, humi, lux) {
        
    //     var chart =  Highcharts.chart('#chartHours', {
    //         chart: {
    //             type: 'column'
    //         },
    //         title: {
    //             text: 'Temperature and Humidity'
    //         },
    //         xAxis: {
    //             title: {
    //             text: 'Date and Time',
    //             },
    //         },
    //         yAxis: {
    //             min: 0,
    //             title: {
    //                 text: 'Parameters'
    //             }
    //         },
    //         tooltip: {
    //             headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
    //             pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
    //                 '<td style="padding:0"><b>{point.y:.f}</b></td></tr>',
    //             footerFormat: '</table>',
    //             shared: true,
    //             useHTML: true
    //         },
    //         plotOptions: {
    //             column: {
    //                 pointPadding: 0,
    //                 borderWidth: 3
    //             }
    //         },
    //         series: [{
    //             name: 'Độ ẩm %',
    //             data: []

    //         }, {
    //             name: 'Nhiệt độ °C',
    //             data: []


    //         },{
    //             name: 'Ánh sáng',
    //             data: []

    //         }]
    //     });

    //     chart.series[0] = humi;
    //     chart.series[1] = temp;
    //     chart.series[2] = lux;
    //     chart.xAxis[0] = time;

    // },

    showNotification: function() {
        color = Math.floor((Math.random() * 4) + 1);

        $.notify({
            icon: "nc-icon nc-satisfied",
            message: "Welcome to <b>My Dashboard</b>"
        }, {
            type: type[color],
            timer: 8000,
            placement: {
                from: top,
                align: middle
            }
        });
    }
}