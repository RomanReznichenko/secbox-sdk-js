import 'reflect-metadata';
import { Configuration } from './Configuration';
import { EnvCredentialProvider } from '../credentials-provider';
import { instance, mock, reset, verify, when } from 'ts-mockito';

describe('Configuration', () => {
  const mockedProvider = mock<EnvCredentialProvider>();

  afterEach(() => reset(mockedProvider));

  describe('constructor', () => {
    it('should be a single instance', () => {
      const configuration = new Configuration({
        cluster: 'example.com'
      });
      const configuration2 = configuration.container.resolve(Configuration);
      expect(configuration).toBe(configuration2);
    });

    it('should throw if cluster is not passed', () => {
      expect(
        () =>
          new Configuration({
            cluster: ''
          })
      ).toThrow();
    });

    it('should throw an error if credentials or credential providers are not passed', () => {
      expect(
        () =>
          new Configuration({
            cluster: 'example.com',
            credentialProviders: []
          })
      ).toThrow();
    });

    it('should use options with default values', () => {
      const config = new Configuration({
        cluster: 'example.com'
      });

      expect(config).toMatchObject({
        credentialProviders: expect.arrayContaining([
          expect.any(EnvCredentialProvider)
        ])
      });
    });

    it.each([
      {
        input: 'localhost',
        expected: { bus: 'amqp://localhost:5672', api: 'http://localhost:8000' }
      },
      {
        input: 'localhost:8080',
        expected: { bus: 'amqp://localhost:5672', api: 'http://localhost:8000' }
      },
      {
        input: 'http://localhost',
        expected: { bus: 'amqp://localhost:5672', api: 'http://localhost:8000' }
      },
      {
        input: 'http://localhost:8080',
        expected: { bus: 'amqp://localhost:5672', api: 'http://localhost:8000' }
      },
      {
        input: '127.0.0.1',
        expected: { bus: 'amqp://127.0.0.1:5672', api: 'http://127.0.0.1:8000' }
      },
      {
        input: '127.0.0.1:8080',
        expected: { bus: 'amqp://127.0.0.1:5672', api: 'http://127.0.0.1:8000' }
      },
      {
        input: 'http://127.0.0.1',
        expected: { bus: 'amqp://127.0.0.1:5672', api: 'http://127.0.0.1:8000' }
      },
      {
        input: 'http://127.0.0.1:8080',
        expected: { bus: 'amqp://127.0.0.1:5672', api: 'http://127.0.0.1:8000' }
      },
      {
        input: 'example.com',
        expected: {
          bus: 'amqps://amq.example.com:5672',
          api: 'https://example.com'
        }
      },
      {
        input: 'example.com:443',
        expected: {
          bus: 'amqps://amq.example.com:5672',
          api: 'https://example.com'
        }
      },
      {
        input: 'http://example.com',
        expected: {
          bus: 'amqps://amq.example.com:5672',
          api: 'https://example.com'
        }
      },
      {
        input: 'http://example.com:443',
        expected: {
          bus: 'amqps://amq.example.com:5672',
          api: 'https://example.com'
        }
      }
    ])(
      'should generate correct api and bus for $input',
      ({ expected, input }) => {
        const configuration = new Configuration({
          cluster: input
        });

        expect(configuration).toMatchObject(expected);
      }
    );

    it('should throw an error if cluster is wrong', () => {
      expect(
        () =>
          new Configuration({
            cluster: ':test'
          })
      ).toThrow("pass correct 'cluster' option");
    });
  });

  describe('loadCredentials', () => {
    it('should do nothing if provider not defined', async () => {
      const credentials = {
        token: 'weobbz5.nexa.vennegtzr2h7urpxgtksetz2kwppdgj0'
      };
      const configuration = new Configuration({
        credentials,
        cluster: 'app.neuralegion.com'
      });

      await configuration.loadCredentials();

      expect(configuration).toMatchObject({ credentials });
    });

    it('should load credentials using a provider', async () => {
      const credentials = {
        token: 'weobbz5.nexa.vennegtzr2h7urpxgtksetz2kwppdgj0'
      };
      const configuration = new Configuration({
        cluster: 'app.neuralegion.com',
        credentialProviders: [instance(mockedProvider)]
      });
      when(mockedProvider.get()).thenResolve(credentials);

      await configuration.loadCredentials();

      verify(mockedProvider.get()).once();
      expect(configuration).toMatchObject({ credentials });
    });

    it('should throw an error if no one provider does not find credentials', async () => {
      const configuration = new Configuration({
        cluster: 'app.neuralegion.com',
        credentialProviders: [instance(mockedProvider)]
      });
      when(mockedProvider.get()).thenResolve(undefined);

      const result = configuration.loadCredentials();

      await expect(result).rejects.toThrow('Could not load credentials');
    });
  });
});
