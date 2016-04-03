;(function($, undefined) {

  // The https://riders.uber.com/trips scraper specification
  var scraper = {
    iterator: '.hard .palm-one-whole',
    data: {
      trip_id: function($) { return $(this).closest('tr').prev().data('target').slice(6); },
      date: function($) { return $(this).closest('tr').prev().find('td:nth-child(2)').text().substring(0,8); },
      date_time: {sel: 'h6:nth-child(3)', method: 'text'},
      driver: function($) { return $(this).closest('tr').prev().find('td:nth-child(3)').text(); },
      car_type: function($) { return $(this).closest('tr').prev().find('td:nth-child(5)').text(); },
      city: function($) { return $(this).closest('tr').prev().find('td:nth-child(6)').text(); },
      price: {sel: 'h3', method: 'text'},
      payment_method: function($) { return $(this).closest('tr').prev().find('td:nth-child(7) span:nth-child(2)').text().slice(-4); },
      start_time: { sel: '.trip-address:nth-child(1) p', method:'text'},
      start_address: { sel: '.trip-address:nth-child(1) h6', method:'text'},
      end_time: { sel: '.trip-address:nth-child(2) p', method:'text'},
      end_address: { sel: '.trip-address:nth-child(2) h6', method:'text'}
    }
  };

  // Handle pagination
  function nextUrl($page) {
    return $page.find('.pagination__next').attr('href');
  }

  // Start the scraper
  artoo.log.debug('Starting the scraper...');
  var ui = new artoo.ui();
  ui.$().append('<div style="position:fixed; top:35px; left:25px; background-color: #000; color: #FFF; z-index:1000">Scraping in progress...</div>');
  var uber = artoo.scrape(scraper);

  // Launch the spider
  artoo.ajaxSpider(
    function(i, $data) {
      return nextUrl(!i ? artoo.$(document) : $data);
    },
    {
      limit: 500,
      throttle: 1000,
      scrape: scraper,
      concat: true,
      done: function(data) {
        artoo.log.debug('Finished retrieving data. Downloading...');
        ui.kill();
        artoo.saveCsv(
          uber.concat(data),
          {filename: 'trip-history.csv'}
        );
      }
    });
}).call(this, artoo.$);
