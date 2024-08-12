<?php
namespace App\Http\Responses;

use App\Helpers\General\LogHelper;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SSEResponse extends StreamedResponse
{
    protected $responseBody;

    public function __construct($responseBody)
    {
        parent::__construct();

        $this->responseBody = $responseBody;

        $this->headers->set('Content-Type', 'text/event-stream');
        $this->headers->set('Cache-Control', 'no-cache');
        $this->headers->set('Connection', 'keep-alive');
        $this->headers->set('X-Accel-Buffering', 'no');
    }

    public function create()
    {
        $this->setCallback(function() {
            ob_implicit_flush(true);
            $copy = $this->responseBody;
            // LogHelper::debug('Copy: ', [$copy->getContents()]);
            $stream = $this->responseBody->detach();
            $counter = 0;
            $incomplete = '';

            stream_set_blocking($stream, false); // Set stream to non-blocking mode

            while (!feof($stream)) {
                $line = fgets($stream);
                // LogHelper::debug("-- Line ($counter): ", [$line.PHP_EOL]);
                // $counter ++;
                if ($line === false) {
                    continue;
                }

                $line = trim($line);
                if (empty($line) || $line === 'data: [DONE]') {
                    continue;
                }
                // LogHelper::debug("-- Line ($counter): ", [$line]);

                // Check if the line starts with 'data:' and ends with '}}'
                if (preg_match('/^data:.*}}$/', $line)) {
                    // Complete line, process it
                    // LogHelper::debug("-- Line ($counter): ", [$line]);
                    echo "event: subject\n";
                    echo $line . "\n\n";
                } else {
                    // Incomplete line, save it and try to reconstitute
                    $incomplete .= $line;

                    // Check if the concatenated line now forms a complete JSON string
                    if (preg_match('/^data:.*}}$/', $incomplete)) {
                        // LogHelper::debug("-- Line ($counter): ", [$incomplete]);
                        echo "event: subject\n";
                        echo $incomplete . "\n\n";
                        $incomplete = ''; // Reset incomplete after processing
                    }
                }

                $counter ++;

                // Flush the output buffers to send the data to the client immediately
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            }

            fclose($stream);
            // $counter = rand(1, 30);
            // while (true) {
            //     echo "event: subject\n";
            //     echo 'data: {"Counter": "' . $counter . '"}';
            //     echo "\n\n";

            //     $counter--;

            //     if (ob_get_contents()) {
            //         ob_end_flush();
            //     }
            //     flush();

            //     if ($counter < 1) break;

            //     sleep(1);
            // }
        });

        return $this;
    }
}
